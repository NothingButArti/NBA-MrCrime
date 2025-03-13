/**
 * Haupteinstiegspunkt für den Client-Code
 * 
 * Diese Datei dient als zentraler Einstiegspunkt und initialisiert alle notwendigen Module.
 * Die eigentliche Funktionalität ist in separaten Modulen organisiert.
 */

/// <reference types="@citizenfx/client"/>
/// <reference path="./types/fivem.d.ts"/>

import { MissionTypes, MissionStep } from '@shared/types';
import { handleMissionProgress, validateMissions} from './missionController';
import { NPCManager } from './modules/npcManager';
import { MenuManager } from './modules/menuManager';
import { MissionManager } from './modules/missionManager';
import { showNotification } from './modules/utils';

// Singleton-Instanzen der Manager
let npcManager: NPCManager;
let menuManager: MenuManager;
let missionManager: MissionManager;

// Globale Konfiguration und Missionen
let MISSIONS: MissionTypes.CrimeMission[] = [];

/**
 * Initialisiert die Ressource
 */
async function initializeResource(): Promise<void> {
    console.log('[NBA-MrCrime] Ressource wird initialisiert...');
    
    try {
        // Lade Missionen
        await loadMissions();
        
        // Initialisiere die Manager
        npcManager = new NPCManager();
        menuManager = new MenuManager(MISSIONS);
        missionManager = new MissionManager(MISSIONS);
        
        // Registriere globale Events
        registerEvents();
        
        // Verzögerung einbauen, um sicherzustellen, dass die Umgebung geladen ist
        console.log('[NBA-MrCrime] Warte auf vollständiges Laden der Umgebung vor NPC-Spawn...');
        await new Promise(resolve => setTimeout(resolve, 8000)); // 8 Sekunden warten
        
        // Initialisiere den NPC
        await npcManager.initialize();
        
        console.log('[NBA-MrCrime] Ressource erfolgreich initialisiert');
    } catch (error) {
        console.error('[NBA-MrCrime] Fehler bei der Initialisierung:', error);
    }
}

/**
 * Lädt die Missionen aus der Konfiguration
 */
async function loadMissions(): Promise<void> {
    console.log('[NBA-MrCrime] Lade Missionen...');
    
    try {
        // Warte kurz, um sicherzustellen, dass die Ressource vollständig geladen ist
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Versuche die Missionen über verschiedene Wege zu laden
        const configMissions = (globalThis as any).Config;
        if (configMissions && Array.isArray(configMissions) && configMissions.length > 0) {
            MISSIONS = configMissions;
            console.log(`[NBA-MrCrime] Missionen über globalThis.Config geladen: ${MISSIONS.length}`);
        } else {
            try {
                MISSIONS = exports['NBA-MrCrime'].getMissions();
                console.log(`[NBA-MrCrime] Missionen über Export geladen: ${MISSIONS.length}`);
            } catch (exportError) {
                console.error('[NBA-MrCrime] Fehler beim Laden über Export:', exportError);
            }
        }
        
        // Validiere die Missionen
        if (MISSIONS && Array.isArray(MISSIONS) && MISSIONS.length > 0) {
            MISSIONS = validateMissions(MISSIONS);
            
            console.log('[NBA-MrCrime] Missionen erfolgreich geladen:', {
                anzahl: MISSIONS.length,
                ersteMission: MISSIONS[0]?.title
            });
        } else {
            console.error('[NBA-MrCrime] Keine Missionen geladen!');
        }
    } catch (error) {
        console.error('[NBA-MrCrime] Fehler beim Laden der Missionen:', error);
    }
}

/**
 * Registriert globale Events
 */
function registerEvents(): void {
    // NPC-Menü öffnen
    onNet('crime-npc:openMenu', () => {
        console.log('[NBA-MrCrime] openMenu Event wurde ausgelöst');
        try {
            menuManager.openMainMenu();
            console.log('[NBA-MrCrime] Hauptmenü wurde erfolgreich geöffnet');
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Öffnen des Hauptmenüs:', error);
        }
    });
    
    // Missionen anzeigen
    onNet('crime-npc:showMissions', () => {
        console.log(`[NBA-MrCrime] showMissions Event ausgelöst. MISSIONS-Array Länge: ${MISSIONS.length}`);
        if (MISSIONS.length === 0) {
            console.error('[NBA-MrCrime] FEHLER: Keine Missionen verfügbar!');
        }
        menuManager.showMissionsList();
    });
    
    // Mission starten
    onNet('crime-npc:startMission', (data: { missionId: string }) => {
        missionManager.startMission(data.missionId);
    });
    
    // Item einsammeln
    onNet('crime-npc:collectMissionItem', () => {
        console.log('[NBA-MrCrime] collectMissionItem Event empfangen');
        missionManager.collectMissionItem();
    });
    
    // Mission abbrechen
    onNet('crime-npc:cancelMission', () => {
        missionManager.cancelMission();
    });
    
    // Gesprächsoptionen
    onNet('crime-npc:conversation', (data: { dialogId: string }) => {
        console.log('[NBA-MrCrime] Conversation Event empfangen:', data);
        if (!data || !data.dialogId) {
            console.error('[NBA-MrCrime] Fehler: Keine dialogId im Event-Data!');
            return;
        }
        menuManager.showConversation(data.dialogId);
    });
    
    // Missionen neu laden
    onNet('crime-npc:reloadMissions', async () => {
        await loadMissions();
        menuManager.updateMissions(MISSIONS);
        missionManager.updateMissions(MISSIONS);
    });

    // Command für Debugging (optional)
    RegisterCommand('mrcrime_reload', async () => {
        showNotification('Lade Missionen neu...', 'primary');
        await loadMissions();
        menuManager.updateMissions(MISSIONS);
        missionManager.updateMissions(MISSIONS);
        showNotification('Missionen neu geladen!', 'success');
    }, false);
    
    // Debug-Befehl zum Neuerstellen des NPCs
    RegisterCommand('mrcrime_respawn_npc', async () => {
        showNotification('Spawne NPC neu...', 'primary');
        
        // NPC entfernen falls vorhanden
        if (npcManager) {
            npcManager.cleanup();
            // Kurz warten
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // NPC neu initialisieren
        npcManager = new NPCManager();
        await npcManager.initialize();
        
        // Manager aktualisieren
        const npcCoords = npcManager.getNPCCoords();
        missionManager.setNPCCoords(npcCoords);
        
        showNotification('NPC neu gespawnt!', 'success');
    }, false);

    // Übergabe-Dialog für Missionsabschluss anzeigen
    onNet('crime-npc:showTurnInDialog', (missionId: string) => {
        console.log(`[NBA-MrCrime] Übergabe-Dialog für Mission ${missionId} angefordert`);
        menuManager.showTurnInDialog(missionId);
    });
    
    // Mission abgeben und abschließen
    onNet('crime-npc:turnInMission', (data: { missionId: string }) => {
        console.log(`[NBA-MrCrime] Mission ${data.missionId} wird abgegeben und abgeschlossen`);
        missionManager.completeMission();
    });
}

// Initialisiere beim Resource-Start
on('onClientResourceStart', (resourceName: string) => {
    if (resourceName === GetCurrentResourceName()) {
        initializeResource();
    }
});
                