/**
 * Mission-Manager
 * 
 * Diese Klasse verwaltet alle Missionen, deren Zustände und den Fortschritt.
 */

import { MissionTypes, MissionStep } from '@shared/types';
import { handleMissionProgress, spawnMissionObject } from '../missionController';
import { showNotification } from './utils';

export class MissionManager {
    private missions: MissionTypes.CrimeMission[] = [];
    private activeMission: MissionTypes.CrimeMission | null = null;
    private missionBlip: number | null = null;
    private missionObject: number | null = null;
    private missionStep: MissionStep = MissionStep.NONE;
    private missionTick: number | null = null;
    private npcCoords: { x: number, y: number, z: number };
    private isNearNPC: boolean = false;

    constructor(missions: MissionTypes.CrimeMission[]) {
        this.missions = missions;
        this.npcCoords = this.loadNPCCoords();
    }

    /**
     * Lädt die NPC-Koordinaten aus der Konfiguration
     */
    private loadNPCCoords(): { x: number, y: number, z: number } {
        try {
            const npcConfig = exports['NBA-MrCrime'].getNPCConfig();
            if (npcConfig?.coords) return npcConfig.coords;
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Laden der NPC-Koordinaten');
        }
        return { x: 123.87, y: -1082.22, z: 29.19 };
    }

    /**
     * Aktualisiert die Missionsliste
     */
    public updateMissions(missions: MissionTypes.CrimeMission[]): void {
        this.missions = missions;
    }

    /**
     * Setzt die NPC-Koordinaten
     */
    public setNPCCoords(coords: { x: number, y: number, z: number }): void {
        this.npcCoords = coords;
    }

    /**
     * Gibt die aktive Mission zurück
     */
    public getActiveMission(): MissionTypes.CrimeMission | null {
        return this.activeMission;
    }

    /**
     * Startet eine Mission
     */
    public startMission(missionId: string): void {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission) {
            showNotification('Diese Mission ist nicht verfügbar.', 'error');
            return;
        }
        
        // Bereits aktive Mission aufräumen
        if (this.activeMission) this.cleanupMission();
        
        // Mission initialisieren
        this.activeMission = mission;
        this.missionStep = MissionStep.GOTO_LOCATION;
        
        // Wegpunkt zum Missionsort setzen
        this.setMissionBlip(mission.location.x, mission.location.y, mission.location.z, 'Missionsort');
        
        // Server über Missionsstart informieren
        emitNet('crime:server:startMission', missionId);
        
        // Spieler benachrichtigen und Überwachung starten
        showNotification(`Mission "${mission.title}" gestartet! Begib dich zum markierten Ort.`, 'success');
        this.startMissionTick();
        
        // Menü aktualisieren
        emit('crime-npc:openMenu');
    }

    /**
     * Bricht die aktive Mission ab
     */
    public cancelMission(): void {
        if (!this.activeMission) return;
        
        showNotification(`Mission "${this.activeMission.title}" abgebrochen.`, 'error');
        emitNet('crime:server:cancelMission', this.activeMission.id);
        this.cleanupMission();
        emit('crime-npc:openMenu');
    }

    /**
     * Sammelt das Missions-Item ein
     */
    public collectMissionItem(): void {
        if (!this.activeMission || this.missionStep !== MissionStep.COLLECT_ITEM) {
            console.log('[NBA-MrCrime] collectMissionItem: Keine aktive Item-Mission gefunden oder falscher Schritt.');
            return;
        }
        
        console.log(`[NBA-MrCrime] Sammle Item für Mission ${this.activeMission.id}, Objekt-ID: ${this.missionObject}`);
        
        // Objekt entfernen und Mission fortführen
        this.cleanupMissionObject();
        this.missionStep = MissionStep.RETURN_TO_NPC;
        
        // Wegpunkt zum NPC setzen
        this.setMissionBlip(this.npcCoords.x, this.npcCoords.y, this.npcCoords.z, 'Gehe zurück zu Mr Crime');
        
        // Benachrichtigung anzeigen
        showNotification(`Du hast ${this.activeMission.data.itemLabel || 'den Gegenstand'} gefunden. Bring ihn zurück zu Mr Crime.`, 'success');
        
        // Missionslogik ausführen und Server benachrichtigen
        handleMissionProgress(this.activeMission, this.missionStep);
        emitNet('crime:server:collectItem', this.activeMission.id, this.activeMission.data.itemName);
    }

    /**
     * Schließt die Mission ab
     */
    public completeMission(): void {
        if (!this.activeMission) return;
        
        showNotification(`Mission "${this.activeMission.title}" abgeschlossen! Du erhältst $${this.activeMission.reward.money} und ${this.activeMission.reward.xp} XP.`, 'success', 7000);
        emitNet('crime:server:completeMission', this.activeMission.id);
        this.cleanupMission();
    }

    /**
     * Räumt die aktive Mission und zugehörige Ressourcen auf
     */
    private cleanupMission(): void {
        // Blip und Objekt entfernen
        if (this.missionBlip !== null) {
            RemoveBlip(this.missionBlip);
            this.missionBlip = null;
        }
        
        this.cleanupMissionObject();
        
        // Mission-Tick stoppen
        if (this.missionTick) {
            clearTick(this.missionTick);
            this.missionTick = null;
        }
        
        // Mission zurücksetzen
        this.activeMission = null;
        this.missionStep = MissionStep.NONE;
    }
    
    /**
     * Entfernt das Missionsobjekt
     */
    private cleanupMissionObject(): void {
        if (this.missionObject !== null) {
            exports['qb-target'].RemoveTargetEntity(this.missionObject);
            DeleteObject(this.missionObject);
            this.missionObject = null;
        }
    }

    /**
     * Setzt einen Wegpunkt für die Mission
     */
    private setMissionBlip(x: number, y: number, z: number, label: string): void {
        // Alten Blip entfernen
        if (this.missionBlip !== null) {
            RemoveBlip(this.missionBlip);
        }
        
        // Neuen Blip erstellen
        this.missionBlip = AddBlipForCoord(x, y, z);
        SetBlipSprite(this.missionBlip, 1);
        SetBlipColour(this.missionBlip, 5); // Gelb
        SetBlipRoute(this.missionBlip, true);
        SetBlipRouteColour(this.missionBlip, 5);
        BeginTextCommandSetBlipName('STRING');
        AddTextComponentString(label);
        EndTextCommandSetBlipName(this.missionBlip);
    }

    /**
     * Startet den Tick für die Missionsfortschritt-Überwachung
     */
    private startMissionTick(): void {
        if (this.missionTick !== null) clearTick(this.missionTick);
        
        this.missionTick = setTick(() => {
            if (!this.activeMission) return;
            
            const playerPed = PlayerPedId();
            const [x, y, z] = GetEntityCoords(playerPed, false);
            
            if (this.missionStep === MissionStep.GOTO_LOCATION) {
                this.handleGotoLocationStep(x, y, z);
            } else if (this.missionStep === MissionStep.RETURN_TO_NPC) {
                this.handleReturnToNPCStep(x, y, z);
            }
        });
    }
    
    /**
     * Behandelt den Schritt "Gehe zum Missionsort"
     */
    private handleGotoLocationStep(playerX: number, playerY: number, playerZ: number): void {
        if (!this.activeMission) return;
        
        const loc = this.activeMission.location;
        const distance = Vdist(playerX, playerY, playerZ, loc.x, loc.y, loc.z);
        
        if (distance < 20.0) {
            // Spieler ist am Missionsort angekommen
            this.missionStep = MissionStep.COLLECT_ITEM;
            
            // Blip entfernen
            if (this.missionBlip !== null) {
                RemoveBlip(this.missionBlip);
                this.missionBlip = null;
            }
            
            // Missionslogik ausführen
            handleMissionProgress(this.activeMission, this.missionStep);
            
            // Objekt für Item-Missionen spawnen
            if (this.activeMission.missionType === 'steal_item') {
                this.spawnMissionObject();
            }
        }
    }
    
    /**
     * Behandelt den Schritt "Kehre zum NPC zurück"
     */
    private handleReturnToNPCStep(playerX: number, playerY: number, playerZ: number): void {
        const npc = this.npcCoords;
        const distance = Vdist(playerX, playerY, playerZ, npc.x, npc.y, npc.z);
        
        if (distance < 3.0 && !this.isNearNPC) {
            // Spieler ist beim NPC angekommen
            this.isNearNPC = true;
            
            // Übergabedialog öffnen
            emit('crime-npc:showTurnInDialog', this.activeMission?.id);
            showNotification('Sprich mit Mr Crime, um den Auftrag abzuschließen.', 'primary');
        } else if (distance > 5.0 && this.isNearNPC) {
            // Spieler hat sich entfernt
            this.isNearNPC = false;
        }
    }

    /**
     * Spawnt das Missionsobjekt
     */
    private async spawnMissionObject(): Promise<void> {
        if (!this.activeMission || this.activeMission.missionType !== 'steal_item') return;
        
        try {
            console.log(`[NBA-MrCrime] Spawne Missionsobjekt für Mission ${this.activeMission.id}`);
            const objectId = await spawnMissionObject(this.activeMission);
            
            if (objectId && objectId !== 0) {
                this.missionObject = objectId;
                console.log(`[NBA-MrCrime] Missionsobjekt mit ID ${objectId} gespeichert`);
            } else {
                console.error('[NBA-MrCrime] Konnte Missionsobjekt nicht spawnen!');
            }
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Spawnen des Missionsobjekts:', error);
        }
    }
} 