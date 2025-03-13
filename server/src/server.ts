/**
 * Haupteinstiegspunkt für den Server-Code
 */

/// <reference types="@citizenfx/server"/>

// Importiere die Config über globalThis, da das Dateisystem-Modul anders strukturiert ist
const MISSIONS = (globalThis as any).Config;

// Typen für lokale Verwendung
interface ItemData {
    name: string;
    amount: number;
}

interface MissionReward {
    money: number;
    xp: number;
    items?: ItemData[];
}

interface MissionItemData {
    itemName: string;
    itemLabel: string;
    itemDescription: string;
    itemImage: string;
    itemModel: string;
    [key: string]: any;
}

interface MissionLocation {
    x: number;
    y: number;
    z: number;
}

interface CrimeMission {
    id: string;
    title: string;
    description: string;
    requiredLevel: number;
    hint: string;
    missionType: string;
    reward: MissionReward;
    data: MissionItemData;
    location: MissionLocation;
}

// Service für Framework-Integrationen (hier für QBCore und ps-inventory)
namespace FrameworkService {
    // QBCore Integrationen
    export function getQBCore() {
        return exports['qb-core'].GetCoreObject();
    }
    
    export function getPlayer(playerId: number) {
        return getQBCore().Functions.GetPlayer(playerId);
    }
    
    export function getPlayerCoords(playerId: number): number[] {
        return GetEntityCoords(GetPlayerPed(playerId));
    }
    
    // Inventar-Funktionen
    export function addItem(playerId: number, itemName: string, amount: number, slot?: string, metadata?: any): Promise<boolean> {
        return new Promise((resolve) => {
            exports['ps-inventory'].AddItem(playerId, itemName, amount, slot || '', metadata || {}, (result: boolean) => {
                resolve(result);
            });
        });
    }
    
    export function removeItem(playerId: number, itemName: string, amount: number): boolean {
        return exports['ps-inventory'].RemoveItem(playerId, itemName, amount);
    }
    
    export function hasItem(playerId: number, itemName: string, amount: number): boolean {
        return exports['ps-inventory'].HasItem(playerId, itemName, amount);
    }
    
    export function createDrop(playerId: number, itemName: string, amount: number, coords: number[]): void {
        exports['ps-inventory'].CreateNewDrop(
            playerId, 
            itemName, 
            amount, 
            '', 
            {}, 
            coords[0], 
            coords[1], 
            coords[2]
        );
    }
    
    // Benachrichtigungen
    export function notify(playerId: number, message: string, type: 'success' | 'error' | 'primary' | 'warning', length: number = 5000): void {
        emitNet('QBCore:Notify', playerId, {
            text: message,
            type,
            length
        });
    }
}

// Service für Missionsmanagement
namespace MissionService {
    // Spieler, die gerade in einer Mission sind
    const activeMissions: Record<number, string> = {};
    
    // Prüft, ob der Spieler die angegebene Mission aktiv hat
    export function hasActiveMission(playerId: number, missionId: string): boolean {
        return activeMissions[playerId] === missionId;
    }
    
    // Findet eine Mission anhand ihrer ID
    export function getMissionById(missionId: string): CrimeMission | undefined {
        return MISSIONS.find((m: any) => m.id === missionId);
    }
    
    // Startet eine Mission für einen Spieler
    export function startMission(playerId: number, missionId: string): boolean {
        const mission = getMissionById(missionId);
        if (!mission) {
            console.error(`Mission ${missionId} nicht gefunden!`);
            return false;
        }
        
        // Speichere aktive Mission
        activeMissions[playerId] = missionId;
        console.log(`Spieler ${playerId} hat Mission ${missionId} gestartet`);
        
        // Benachrichtige Spieler
        FrameworkService.notify(
            playerId, 
            'Mission gestartet! Folge den Anweisungen.',
            'success'
        );
        
        return true;
    }
    
    // Sammelt ein Item für eine Mission ein
    export async function collectItem(playerId: number, missionId: string, itemName: string): Promise<boolean> {
        // Prüfen, ob Spieler die Mission aktiv hat
        if (!hasActiveMission(playerId, missionId)) {
            console.log(`Spieler ${playerId} hat versucht, ein Item zu sammeln ohne aktive Mission`);
            return false;
        }
        
        const QBCore = FrameworkService.getQBCore();
        console.log(`Spieler ${playerId} hat Item ${itemName} für Mission ${missionId} eingesammelt`);
        
        // Item zum Inventar hinzufügen
        const success = await FrameworkService.addItem(playerId, itemName, 1);
        
        if (success) {
            // Benachrichtigung bei Erfolg
            FrameworkService.notify(
                playerId,
                `Du hast 1x ${QBCore.Shared.Items[itemName]?.label || itemName} erhalten.`,
                'success'
            );
            return true;
        } else {
            // Fehlerbenachrichtigung wenn Inventar voll
            FrameworkService.notify(playerId, 'Dein Inventar ist voll!', 'error');
            return false;
        }
    }
    
    // Schließt eine Mission ab und verteilt Belohnungen
    export async function completeMission(playerId: number, missionId: string): Promise<boolean> {
        // Prüfen, ob Spieler die Mission wirklich aktiv hat
        if (!hasActiveMission(playerId, missionId)) {
            console.log(`Spieler ${playerId} hat versucht, eine Mission abzuschließen, die nicht aktiv ist`);
            return false;
        }
        
        const mission = getMissionById(missionId);
        if (!mission) {
            console.error(`Mission ${missionId} nicht gefunden!`);
            return false;
        }
        
        const Player = FrameworkService.getPlayer(playerId);
        if (!Player) {
            console.error(`Spieler ${playerId} konnte nicht gefunden werden!`);
            return false;
        }
        
        // Entfernen des Missionsitems, falls notwendig
        if (mission.data && mission.data.itemName) {
            const hasItem = FrameworkService.hasItem(playerId, mission.data.itemName, 1);
            
            if (hasItem) {
                FrameworkService.removeItem(playerId, mission.data.itemName, 1);
            } else {
                // Wenn das Item fehlt, kann die Mission nicht abgeschlossen werden
                FrameworkService.notify(
                    playerId,
                    'Du hast das benötigte Item nicht mehr bei dir!',
                    'error'
                );
                return false;
            }
        }
        
        // Geld als Belohnung
        if (mission.reward.money && mission.reward.money > 0) {
            Player.Functions.AddMoney('cash', mission.reward.money);
        }
        
        // Item-Belohnungen
        if (mission.reward.items && mission.reward.items.length > 0) {
            await Promise.all(mission.reward.items.map(async (item) => {
                const result = await FrameworkService.addItem(playerId, item.name, item.amount);
                
                if (!result) {
                    // Item auf den Boden fallen lassen, wenn das Inventar voll ist
                    const coords = FrameworkService.getPlayerCoords(playerId);
                    FrameworkService.createDrop(playerId, item.name, item.amount, coords);
                    
                    FrameworkService.notify(
                        playerId,
                        'Dein Inventar ist voll! Item wurde auf den Boden fallen gelassen.',
                        'warning'
                    );
                }
            }));
        }
        
        // Entferne den Spieler aus der aktiven Missionsliste
        delete activeMissions[playerId];
        
        // Erfolgs-Benachrichtigung
        FrameworkService.notify(
            playerId,
            `Mission erfolgreich abgeschlossen! Belohnung: $${mission.reward.money}`,
            'success',
            7000
        );
        
        console.log(`Spieler ${playerId} hat Mission ${missionId} abgeschlossen`);
        return true;
    }
    
    // Bricht eine Mission ab
    export function cancelMission(playerId: number, missionId: string): void {
        if (activeMissions[playerId]) {
            delete activeMissions[playerId];
            console.log(`Spieler ${playerId} hat Mission ${missionId} abgebrochen`);
        }
    }
    
    // Bereinigt Missionen beim Disconnect
    export function cleanupPlayerMissions(playerId: number): void {
        if (activeMissions[playerId]) {
            delete activeMissions[playerId];
            console.log(`Spieler ${playerId} ist disconnected, Mission wird abgebrochen`);
        }
    }
}

// Event-Handler registrieren
function registerEventHandlers(): void {
    // Missionsstart
    onNet('crime:server:startMission', (missionId: string) => {
        const playerId = global.source;
        MissionService.startMission(playerId, missionId);
    });
    
    // Item einsammeln
    onNet('crime:server:collectItem', async (missionId: string, itemName: string) => {
        const playerId = global.source;
        await MissionService.collectItem(playerId, missionId, itemName);
    });
    
    // Mission abschließen
    onNet('crime:server:completeMission', async (missionId: string) => {
        const playerId = global.source;
        await MissionService.completeMission(playerId, missionId);
    });
    
    // Mission abbrechen
    onNet('crime:server:cancelMission', (missionId: string) => {
        const playerId = global.source;
        MissionService.cancelMission(playerId, missionId);
    });
    
    // Disconnect-Handler
    on('playerDropped', () => {
        const playerId = global.source;
        MissionService.cleanupPlayerMissions(playerId);
    });
}

// Main-Funktion zum Initialisieren der Ressource
function main(): void {
    console.log('[NBA-MrCrime] Server-Ressource wird initialisiert...');
    
    // Events registrieren
    registerEventHandlers();
    
    console.log('[NBA-MrCrime] Server-Ressource erfolgreich initialisiert!');
}

// Ressource starten
main();

