/**
 * Missionscontroller zur Verwaltung verschiedener Missionstypen
 */

import { MissionTypes, MissionStep } from '@shared/types';
import {showNotification} from './modules/utils'


/// <reference types="@citizenfx/client"/>

/**
 * Hauptfunktion zur Verarbeitung des Missionsfortschritts basierend auf Missionstyp
 */
export function handleMissionProgress(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    console.log(`[NBA-MrCrime] Verarbeite Mission ${mission.id} im Schritt ${step}`);
    
    switch (mission.missionType) {
        case 'steal_item':
            handleItemMission(mission, step);
            break;
        case 'steal_money':
            handleMoneyMission(mission, step);
            break;
        case 'steal_vehicle':
            handleVehicleMission(mission, step);
            break;
        case 'robbery':
            handleRobberyMission(mission, step);
            break;
        default:
            console.error(`[NBA-MrCrime] Unbekannter Missionstyp: ${mission.missionType}`);
    }
}

/**
 * Verarbeitet Item-Diebstahl-Missionen
 */
function handleItemMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    if (step === MissionStep.GOTO_LOCATION) {
        // Logik für Ankunft am Missionsort
        showNotification(`Du hast den Missionsort erreicht. Finde ${mission.data.itemLabel || 'den Gegenstand'}.`, 'primary');
    } else if (step === MissionStep.COLLECT_ITEM) {
        // Logik für Item-Sammlung
        spawnMissionObject(mission);
    } else if (step === MissionStep.RETURN_TO_NPC) {
        // Logik für Rückkehr zum NPC
        showNotification(`Bringe ${mission.data.itemLabel || 'den Gegenstand'} zurück zu Mr Crime.`, 'primary');
    }
}

/**
 * Verarbeitet Geld-Diebstahl-Missionen
 */
function handleMoneyMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    if (step === MissionStep.GOTO_LOCATION) {
        // Implementierung für Geld-Missionen
        showNotification("Du bist am Ort angekommen. Finde das Geld.", 'primary');
    }
    // Weitere Implementierung...
}

/**
 * Verarbeitet Fahrzeug-Diebstahl-Missionen
 */
function handleVehicleMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    if (step === MissionStep.GOTO_LOCATION) {
        // Implementierung für Fahrzeug-Missionen
        showNotification("Du bist am Ort angekommen. Finde das Fahrzeug.", 'primary');
    }
    // Weitere Implementierung...
}

/**
 * Verarbeitet Raub-Missionen
 */
function handleRobberyMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    if (step === MissionStep.GOTO_LOCATION) {
        // Implementierung für Raub-Missionen
        showNotification("Du bist am Zielort. Beginne den Raub.", 'primary');
    }
    // Weitere Implementierung...
}

/**
 * Validiert Missionen und filtert ungültige aus
 */
export function validateMissions(missions: MissionTypes.CrimeMission[]): MissionTypes.CrimeMission[] {
    const validMissions = missions.filter(mission => {
        // Prüfe erforderliche Felder
        const isValid = mission.id && mission.title && mission.missionType;
        
        if (!isValid) {
            console.error(`[NBA-MrCrime] Ungültige Mission gefunden: ${mission.id || 'ID fehlt'}`);
        }
        
        return isValid;
    });
    
    console.log(`[NBA-MrCrime] ${validMissions.length} von ${missions.length} Missionen sind gültig`);
    return validMissions;
}

/**
 * Spawnt ein Objekt für die Mission
 */
export async function spawnMissionObject(mission: MissionTypes.CrimeMission): Promise<number> {
    // Daten aus der Mission nehmen
    const { location } = mission;
    const itemModel = mission.data.itemModel || 'prop_cs_package_01';
    
    console.log(`[NBA-MrCrime] Versuche Missionsobjekt zu spawnen: Model=${itemModel}`);
    
    const modelHash = GetHashKey(itemModel);
    
    if (!IsModelValid(modelHash)) {
        console.error(`[NBA-MrCrime] Modell ${itemModel} ist ungültig! Versuche Fallback-Modell.`);
        // Fallback zu einem Standard-Modell
        const fallbackModel = 'prop_cs_package_01';
        const fallbackHash = GetHashKey(fallbackModel);
        
        console.log(`[NBA-MrCrime] Verwende Fallback-Modell: ${fallbackModel}`);
        await loadModel(fallbackHash);
        
        return createObjectAndSetupInteraction(fallbackHash, location, mission.data.itemLabel || 'Gegenstand');
    }
    
    try {
        // Lade das Modell
        await loadModel(modelHash);
        
        return createObjectAndSetupInteraction(modelHash, location, mission.data.itemLabel || 'Gegenstand');
    } catch (error) {
        console.error(`[NBA-MrCrime] Fehler beim Laden des Modells:`, error);
        return 0;
    }
}

/**
 * Hilfsfunktion zum Erstellen des Objekts und Einrichten der Interaktion
 */
async function createObjectAndSetupInteraction(modelHash: number, location: {x: number, y: number, z: number}, itemLabel: string): Promise<number> {
    // Präzise Bodenhöhe mit Raycast ermitteln
    console.log(`[NBA-MrCrime] Ermittle präzise Bodenhöhe für Objekt an Position: ${location.x}, ${location.y}, ${location.z}`);
    
    let finalZ = location.z;
    
    // Raycast von oben nach unten für genaue Bodenerkennung
    const startPos = [location.x, location.y, location.z + 50.0];
    const endPos = [location.x, location.y, location.z - 50.0];
    
    const ray = StartExpensiveSynchronousShapeTestLosProbe(
        startPos[0], startPos[1], startPos[2],
        endPos[0], endPos[1], endPos[2],
        1, // Berücksichtige nur statische Objekte
        0, // Ignoriere Entity
        0  // Flags
    );
    
    const [_, hit, endCoords, surfaceNormal, materialHash] = GetShapeTestResultIncludingMaterial(ray);
    
    if (hit) {
        console.log(`[NBA-MrCrime] Raycast traf Boden bei Z = ${endCoords[2]}, Material: ${materialHash}`);
        finalZ = endCoords[2] + 0.2; // Objekt leicht über dem Boden platzieren
    } else {
        // Fallback zur Standard-Methode
        const [foundGround, groundZ] = GetGroundZFor_3dCoord(
            location.x, 
            location.y, 
            100.0, // Start von weit oben
            true
        );
        
        if (foundGround) {
            console.log(`[NBA-MrCrime] Boden gefunden mit GetGroundZFor_3dCoord bei Z = ${groundZ}`);
            finalZ = groundZ + 0.2;
        } else {
            console.warn('[NBA-MrCrime] Konnte keinen Boden finden, verwende Original-Z-Wert');
        }
    }
    
    // Objekt spawnen
    const object = CreateObjectNoOffset(
        modelHash, 
        location.x, 
        location.y, 
        finalZ, 
        true, 
        false, 
        false
    );
    
    if (!object || object === 0) {
        console.error(`[NBA-MrCrime] Fehler beim Erstellen des Objekts!`);
        return 0;
    }
    
    // Kurz warten, damit die Engine das Objekt korrekt platzieren kann
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Physik für das Objekt aktivieren und auf den Boden legen
    SetEntityDynamic(object, true);
    
    // Kollision und Physik einstellen
    SetEntityHasGravity(object, true);
    SetEntityCollision(object, true, true);
    
    // Nur nach einer kurzen Verzögerung auf den Boden legen
    await new Promise(resolve => setTimeout(resolve, 100));
    PlaceObjectOnGroundProperly(object);
    FreezeEntityPosition(object, true);
    
    console.log(`[NBA-MrCrime] Objekt mit ID ${object} erstellt und auf dem Boden platziert`);
    
    // Füge Interaktionsmöglichkeit mit qb-target hinzu
    if (DoesEntityExist(object)) {
        exports['qb-target'].AddTargetEntity(object, {
            options: [
                {
                    type: "client",
                    icon: 'fas fa-hand-paper',
                    label: `${itemLabel} aufheben`,
                    action: function() {
                        emit('crime-npc:collectMissionItem');
                    }
                }
            ],
            distance: 2.5
        });
        
        console.log(`[NBA-MrCrime] Interaktion zum Objekt hinzugefügt`);
    }
    
    // Modell freigeben
    SetModelAsNoLongerNeeded(modelHash);
    
    return object;
}

/**
 * Hilfsfunktion zum Laden eines Modells
 */
export async function loadModel(modelHash: number): Promise<void> {
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


