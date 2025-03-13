/**
 * NPC-Manager
 * 
 * Diese Klasse ist verantwortlich für das Spawnen und Verwalten des NPCs.
 */

/// <reference types="@citizenfx/client"/>

// Interface für NPC-Konfiguration
interface NPCConfig {
    coords: {
        x: number;
        y: number;
        z: number;
        heading: number;
    };
    model: string;
}

export class NPCManager {
    private npcPed: number | null = null;
    private npcConfig: NPCConfig;
    private hasSpawned: boolean = false;

    constructor() {
        // Versuche, die NPC-Konfiguration zu laden
        try {
            this.npcConfig = exports['NBA-MrCrime'].getNPCConfig();
            if (!this.npcConfig) {
                console.error('[NBA-MrCrime] NPC_CONFIG konnte nicht über Exports geladen werden, verwende Standardkonfiguration');
                this.npcConfig = this.getDefaultConfig();
            } else {
                console.log('[NBA-MrCrime] NPC_CONFIG erfolgreich über Exports geladen');
            }
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Laden von NPC_CONFIG:', error);
            this.npcConfig = this.getDefaultConfig();
        }
    }

    /**
     * Gibt die Standard-NPC-Konfiguration zurück
     */
    private getDefaultConfig(): NPCConfig {
        return {
            coords: { x: 123.87, y: -1082.22, z: 29.19, heading: 90.0 },
            model: 's_m_y_dealer_01',
        };
    }

    /**
     * Initialisiert den NPC
     */
    public async initialize(): Promise<void> {
        if (this.hasSpawned) return;
        await this.spawnNPC();
    }

    /**
     * Spawnt den NPC
     */
    private async spawnNPC(): Promise<void> {
        try {
            console.log('[NBA-MrCrime] Starte NPC-Spawn-Prozess...');
            
            // Prüfe auf vorhandenen NPC in der Nähe
            if (this.findExistingNPC()) {
                console.log('[NBA-MrCrime] Bestehender NPC gefunden, überspringe Spawn');
                this.hasSpawned = true;
                return;
            }
            
            const modelHash = GetHashKey(this.npcConfig.model);
            if (!IsModelInCdimage(modelHash)) {
                console.error(`[NBA-MrCrime] Model ${this.npcConfig.model} existiert nicht!`);
                return;
            }
            
            // Modell laden
            await this.loadModel(modelHash);
            
            // Ursprüngliche Koordinaten
            const spawnCoords = { ...this.npcConfig.coords };
            
            // NPC erstellen, etwas höher als die angegebene Position
            const safeZ = spawnCoords.z + 2.0; // 2 Einheiten über der konfigurierten Z-Koordinate
            console.log(`[NBA-MrCrime] Erstelle NPC an x=${spawnCoords.x}, y=${spawnCoords.y}, z=${safeZ}`);
            
            this.npcPed = CreatePed(
                1,  // PED_TYPE_CIVMALE
                modelHash, 
                spawnCoords.x, 
                spawnCoords.y, 
                safeZ, // Höhere Position zum Starten
                spawnCoords.heading, 
                false, 
                false
            );
            
            if (!this.npcPed || !DoesEntityExist(this.npcPed)) {
                console.error('[NBA-MrCrime] NPC konnte nicht erstellt werden!');
                return;
            }
            
            // Grundeinstellungen für den NPC setzen
            SetEntityAsMissionEntity(this.npcPed, true, true);
            SetEntityCollision(this.npcPed, true, true);
            
            // Kurz warten, bevor wir die Position anpassen
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Bodenhöhe bestimmen und NPC platzieren
            await this.placeNPCOnGround();
            
            // Weitere NPC-Eigenschaften setzen
            this.setNPCProperties();
            this.addInteraction();
            
            // Markiere als gespawnt
            this.hasSpawned = true;
            console.log('[NBA-MrCrime] NPC erfolgreich gespawnt');
            
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Spawnen des NPCs:', error);
        }
    }

    /**
     * Sucht nach einem bestehenden NPC in der Nähe
     */
    private findExistingNPC(): boolean {
        const nearbyPeds = GetGamePool('CPed');
        const { x, y, z } = this.npcConfig.coords;
        
        for (const ped of nearbyPeds) {
            const coords = GetEntityCoords(ped, false);
            const distance = Vdist(coords[0], coords[1], coords[2], x, y, z);
            
            if (distance < 1.0) {
                this.npcPed = ped;
                return true;
            }
        }
        
        return false;
    }

    /**
     * Lädt ein Modell
     */
    private async loadModel(modelHash: number): Promise<void> {
        RequestModel(modelHash);
        
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (HasModelLoaded(modelHash)) {
                    clearInterval(interval);
                    resolve();
                }
            }, 0);
        });
    }

    /**
     * Platziert den NPC auf dem Boden mit mehreren Fallback-Methoden
     */
    private async placeNPCOnGround(): Promise<void> {
        if (!this.npcPed) return;
        
        console.log('[NBA-MrCrime] Platziere NPC auf dem Boden...');
        
        // Initialer Versuch mit mehreren Methoden zur Bodenerkennung
        let success = false;
        
        // Ragdoll-Sequenz für physikalisch korrekte Platzierung
        const doPedRagdollSequence = async () => {
            // NPC kurz in Ragdoll versetzen, damit die Physik ihn korrekt auf dem Boden platziert
            SetPedToRagdoll(this.npcPed!, 1000, 1000, 0, false, false, false);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Warte einen Moment, dann Ragdoll beenden und Position fixieren
            await new Promise(resolve => setTimeout(resolve, 300));
            ClearPedTasksImmediately(this.npcPed!);
            
            // Position fixieren
            const finalPos = GetEntityCoords(this.npcPed!, false);
            console.log(`[NBA-MrCrime] NPC nach Ragdoll-Platzierung: Z = ${finalPos[2]}`);
            
            // Jetzt fest positionieren
            SetEntityCoords(
                this.npcPed!,
                finalPos[0], finalPos[1], finalPos[2],
                false, false, false, false
            );
            
            return true;
        };
        
        // 1. Methode: Raycast von oben nach unten für die beste Bodenerkennung
        const coords = GetEntityCoords(this.npcPed, false);
        const startPos = [coords[0], coords[1], coords[2] + 20.0]; // Deutlich höher starten
        const endPos = [coords[0], coords[1], coords[2] - 50.0];   // Und weit nach unten prüfen
        
        const ray = StartExpensiveSynchronousShapeTestLosProbe(
            startPos[0], startPos[1], startPos[2],
            endPos[0], endPos[1], endPos[2],
            1, // Berücksichtige nur statische Objekte
            this.npcPed, // Ignoriere diesen NPC
            4 // Flags für komplexere Erkennung
        );
        
        const [_, hit, endCoords, surfaceNormal, materialHash] = GetShapeTestResultIncludingMaterial(ray);
        
        if (hit) {
            console.log(`[NBA-MrCrime] Raycast traf Boden bei Z = ${endCoords[2]}, Material: ${materialHash}`);
            
            // NPC explizit auf den Boden setzen, etwas höher für natürlicheres Aussehen
            SetEntityCoords(
                this.npcPed, 
                coords[0], coords[1], endCoords[2] + 0.05, // Minimal über dem Boden
                false, false, false, false
            );
            await new Promise(resolve => setTimeout(resolve, 500)); // Längere Wartezeit
            
            // Physik nochmal anwenden
            success = await doPedRagdollSequence();
        }
        
        // 2. Methode: GetGroundZFor_3dCoord
        if (!success) {
            const [foundGround, groundZ] = GetGroundZFor_3dCoord(
                coords[0], coords[1], coords[2] + 10.0, // Weiter oben beginnen 
                true // Höchster Punkt statt tiefster
            );
            
            if (foundGround) {
                console.log(`[NBA-MrCrime] Boden gefunden mit GetGroundZ: ${groundZ}`);
                
                // NPC explizit auf den Boden setzen
                SetEntityCoords(
                    this.npcPed, 
                    coords[0], coords[1], groundZ + 0.05, // Minimal über dem Boden
                    false, false, false, false
                );
                await new Promise(resolve => setTimeout(resolve, 500)); // Längere Wartezeit
                
                // Physik nochmal anwenden
                success = await doPedRagdollSequence();
            }
        }
        
        // 3. Methode: Hardcoded Z-Position für diesen spezifischen Ort als Fallback
        if (!success) {
            console.warn('[NBA-MrCrime] Keine Bodenerkennung erfolgreich, verwende feste Z-Position');
            
            // Diese Z-Koordinate ist speziell für den Standardort bei Legion Square
            if (Math.abs(coords[0] - 123.87) < 1.0 && Math.abs(coords[1] - (-1082.22)) < 1.0) {
                console.log('[NBA-MrCrime] Verwende hardcoded Z-Wert für Standard-Position');
                SetEntityCoords(
                    this.npcPed, 
                    coords[0], coords[1], 29.0, // Fester Z-Wert für Legion Square
                    false, false, false, false
                );
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Auch hier Physik anwenden
                await doPedRagdollSequence();
            }
        }
        
        // Final garantieren, dass der NPC nicht schwebt
        FreezeEntityPosition(this.npcPed, false); // Kurz unfreeze für bessere Platzierung
        PlaceObjectOnGroundProperly(this.npcPed);
        await new Promise(resolve => setTimeout(resolve, 500));
        FreezeEntityPosition(this.npcPed, true);  // Wieder freeze
        
        console.log('[NBA-MrCrime] NPC-Platzierung abgeschlossen.');
    }

    /**
     * Setzt alle Eigenschaften des NPCs
     */
    private setNPCProperties(): void {
        if (!this.npcPed) return;
        
        // Als Mission Entity markieren und grundlegende Einstellungen
        FreezeEntityPosition(this.npcPed, true);
        SetEntityInvincible(this.npcPed, true);
        
        // Kritische Einstellungen gegen Weglaufen
        SetBlockingOfNonTemporaryEvents(this.npcPed, true);
        SetPedFleeAttributes(this.npcPed, 0, false);
        SetPedCanRagdoll(this.npcPed, false);
        SetPedCanBeTargetted(this.npcPed, false);
        
        // Flags gegen Reaktionen auf Umgebung
        SetPedConfigFlag(this.npcPed, 208, true); // DISABLE_STUNNING
        SetPedConfigFlag(this.npcPed, 292, true); // DISABLE_SHOCKING_EVENTS
        SetPedConfigFlag(this.npcPed, 17, true);  // NO_AI
        
        // Stehe still und blockiere permanent
        TaskStandStill(this.npcPed, -1);
        TaskStartScenarioInPlace(this.npcPed, "WORLD_HUMAN_SMOKING", 0, true);
        
        // Modell freigeben
        SetModelAsNoLongerNeeded(GetEntityModel(this.npcPed));
    }

    /**
     * Fügt die Interaktion zum NPC hinzu
     */
    private addInteraction(): void {
        if (!this.npcPed) return;
        
        exports['qb-target'].AddTargetEntity(this.npcPed, {
            options: [
                {
                    type: "client",
                    icon: 'fas fa-mask',
                    label: 'Quatschen..',
                    action: function() {
                        emit('crime-npc:openMenu');
                    }
                }
            ],
            distance: 2.5
        });
    }

    /**
     * Entfernt den NPC
     */
    public cleanup(): void {
        if (this.npcPed && DoesEntityExist(this.npcPed)) {
            exports['qb-target'].RemoveTargetEntity(this.npcPed);
            DeleteEntity(this.npcPed);
            this.npcPed = null;
            this.hasSpawned = false;
        }
    }

    /**
     * Gibt die Koordinaten des NPCs zurück
     */
    public getNPCCoords(): {x: number, y: number, z: number} {
        return {
            x: this.npcConfig.coords.x,
            y: this.npcConfig.coords.y,
            z: this.npcConfig.coords.z
        };
    }
} 