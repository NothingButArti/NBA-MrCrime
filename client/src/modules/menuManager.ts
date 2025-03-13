/**
 * Menü-Manager
 * 
 * Diese Klasse verwaltet alle Menüs und Dialoge der Anwendung.
 */

import { MissionTypes } from '@shared/types';
import { showNotification } from '../modules/utils';

// Interface für qb-menu Optionen
interface MenuOption {
    header: string;
    txt?: string;
    icon?: string;
    isMenuHeader?: boolean;
    params?: {
        event: string;
        args?: Record<string, any>;
    };
}

export class MenuManager {
    private missions: MissionTypes.CrimeMission[] = [];
    private activeMission: MissionTypes.CrimeMission | null = null;

    constructor(missions: MissionTypes.CrimeMission[]) {
        this.missions = missions;
    }

    /**
     * Aktualisiert die Missionsliste
     */
    public updateMissions(missions: MissionTypes.CrimeMission[]): void {
        this.missions = missions;
    }

    /**
     * Setzt die aktive Mission
     */
    public setActiveMission(mission: MissionTypes.CrimeMission | null): void {
        this.activeMission = mission;
    }

    /**
     * Öffnet das Hauptmenü für den NPC
     */
    public openMainMenu(): void {
        console.log('[NBA-MrCrime] Erstelle Hauptmenü-Optionen');
        
        const menuItems: MenuOption[] = [];
        
        // Header
        menuItems.push({
            header: "Mr Crime",
            txt: "Der mysteriöse Fremde wartet auf dich...",
            icon: "fas fa-user-secret",
            isMenuHeader: true
        });
        
        // Dialog Option
        console.log('[NBA-MrCrime] Füge Dialog-Option hinzu');
        menuItems.push({
            header: "Erzähl mir mehr über dich",
            txt: "Erfahre mehr über Mr Crime",
            icon: "fas fa-info-circle",
            params: {
                event: "crime-npc:conversation",
                args: { dialogId: "about" }
            }
        });
        
        // Missions Option
        console.log('[NBA-MrCrime] Füge Missions-Option hinzu');
        menuItems.push({
            header: "Hast du Arbeit für mich?",
            txt: "Zeige mir deine Aufträge",
            icon: "fas fa-briefcase",
            params: {
                event: "crime-npc:showMissions"
            }
        });

        // Wenn eine aktive Mission besteht, zeige Abbruch-Option
        if (this.activeMission) {
            console.log('[NBA-MrCrime] Füge Abbruch-Option für aktive Mission hinzu');
            menuItems.push({
                header: "Aktuellen Auftrag abbrechen",
                txt: `Mission "${this.activeMission.title}" abbrechen`,
                icon: "fas fa-times",
                params: {
                    event: "crime-npc:cancelMission"
                }
            });
        }

        // Gesprächsbeenden-Option immer am Ende
        console.log('[NBA-MrCrime] Füge Schließen-Option hinzu');
        menuItems.push({
            header: "Ich bin weg...",
            txt: "Gespräch beenden",
            icon: "fas fa-times-circle",
            params: {
                event: "qb-menu:client:closeMenu"
            }
        });

        // Debug-Ausgabe der finalen Menü-Optionen
        console.log('[NBA-MrCrime] Finale Menü-Optionen:', JSON.stringify(menuItems, null, 2));
        
        // Überprüfe ob qb-menu verfügbar ist
        if (!exports['qb-menu']) {
            console.error('[NBA-MrCrime] FEHLER: qb-menu Export nicht gefunden!');
            return;
        }
        
        // Öffne das Menü mit qb-menu und hideFooter: true
        try {
            exports['qb-menu'].openMenu(menuItems, { hideFooter: true });
            console.log('[NBA-MrCrime] Menü erfolgreich geöffnet');
        } catch (error) {
            console.error('[NBA-MrCrime] Fehler beim Öffnen des Menüs:', error);
        }
    }

    /**
     * Zeigt die Liste der verfügbaren Missionen
     */
    public showMissionsList(): void {
        console.log('[NBA-MrCrime] Zeige Missionsliste an');
        console.log(`[NBA-MrCrime] MISSIONS Array Status:`, {
            isDefined: Array.isArray(this.missions),
            length: this.missions?.length || 0,
            firstMission: this.missions[0]?.title
        });

        if (!this.missions || !Array.isArray(this.missions) || this.missions.length === 0) {
            console.error('[NBA-MrCrime] Keine Missionen verfügbar! Versuche neu zu laden...');
            
            // Versuche die Missionen erneut zu laden
            emit('crime-npc:reloadMissions');
            
            // Zeige Fehlermeldung für den Spieler
            emit('QBCore:Notify', {
                text: 'Momentan sind keine Missionen verfügbar. Bitte versuche es später erneut.',
                type: 'error',
                length: 5000
            });
            return;
        }

        // Erstelle Menüoptionen für jede Mission
        const menuItems: MenuOption[] = [
            {
                header: "Zurück",
                icon: "fas fa-arrow-left",
                params: {
                    event: "crime-npc:openMenu"
                }
            },
            {
                header: "Verfügbare Aufträge",
                txt: "Wähle einen Auftrag aus",
                icon: "fas fa-list",
                isMenuHeader: true
            }
        ];

        // Füge alle Missionen zum Menü hinzu
        this.missions.forEach(mission => {
            menuItems.push({
                header: mission.title,
                txt: `${mission.description} | Belohnung: $${mission.reward.money}`,
                icon: "fas fa-exclamation-circle",
                params: {
                    event: "crime-npc:startMission",
                    args: {
                        missionId: mission.id
                    }
                }
            });
        });

        // Füge eine eigene Schließen-Option hinzu, damit qb-menu nicht automatisch eine hinzufügt
        menuItems.push({
            header: "Ich bin weg...",
            txt: "Gespräch beenden",
            icon: "fas fa-times-circle",
            params: {
                event: "qb-menu:client:closeMenu"
            }
        });

        // Öffne das Menü mit der Option, keine automatische Schließen-Option hinzuzufügen
        const menuConfig = { hideFooter: true }; // Verhindert die Standard-Schließen-Option
        exports['qb-menu'].openMenu(menuItems, menuConfig);
    }

    /**
     * Zeigt einen bestimmten Dialog an
     */
    public showConversation(dialogId: string): void {
        console.log(`[NBA-MrCrime] Zeige Dialog an: ${dialogId}`);
        
        let menuItems: MenuOption[] = [];
        
        switch (dialogId) {
            case "about":
                console.log('[NBA-MrCrime] Erstelle "Über mich" Dialog');
                menuItems = [
                    {
                        header: "Zurück",
                        icon: "fas fa-arrow-left",
                        params: {
                            event: "crime-npc:openMenu"
                        }
                    },
                    {
                        header: "Mr Crime",
                        txt: "Ich halte die Augen offen und die Ohren gespitzt. Du weißt schon, hier und da ein kleines Geschäft, nichts Großes.",
                        icon: "fas fa-user-secret",
                        isMenuHeader: true
                    },
                    {
                        header: "Wie kann ich dir helfen?",
                        txt: "Frage nach konkreten Aufgaben",
                        icon: "fas fa-hands-helping",
                        params: {
                            event: "crime-npc:showMissions"
                        }
                    },
                    {
                        header: "Ich bin weg...",
                        txt: "Gespräch beenden",
                        icon: "fas fa-times-circle",
                        params: {
                            event: "qb-menu:client:closeMenu"
                        }
                    }
                ];
                break;
            default:
                console.log(`[NBA-MrCrime] Unbekannte dialogId: ${dialogId}, zeige Standard-Dialog`);
                menuItems = [
                    {
                        header: "Zurück",
                        icon: "fas fa-arrow-left",
                        params: {
                            event: "crime-npc:openMenu"
                        }
                    },
                    {
                        header: "Ich bin weg...",
                        txt: "Gespräch beenden",
                        icon: "fas fa-times-circle",
                        params: {
                            event: "qb-menu:client:closeMenu"
                        }
                    }
                ];
                break;
        }
        
        // Öffne das Menü mit qb-menu und hideFooter: true
        console.log(`[NBA-MrCrime] Öffne Dialog ${dialogId} mit ${menuItems.length} Optionen`);
        exports['qb-menu'].openMenu(menuItems, { hideFooter: true });
    }

    /**
     * Zeigt den Übergabe-Dialog für eine aktive Mission an
     */
    public showTurnInDialog(missionId: string): void {
        // Finde die aktive Mission anhand der ID
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
            console.error(`[NBA-MrCrime] Keine Mission mit ID ${missionId} gefunden`);
            showNotification('Es ist ein Fehler aufgetreten.', 'error');
            return;
        }
        
        // Erstelle den Dialog mit angepasstem Text je nach Missionstyp
        let dialogText = 'Hier ist das, was du wolltest.';
        let responseText = 'Gut gemacht, das ist genau was ich brauche.';
        
        // Je nach Missionstyp andere Texte verwenden
        if (mission.missionType === 'steal_item' && mission.data.itemLabel) {
            dialogText = `Hier ist ${mission.data.itemLabel} das du wolltest.`;
            responseText = `Perfekt, genau ${mission.data.itemLabel} habe ich gesucht!`;
        } else if (mission.missionType === 'steal_money') {
            dialogText = 'Hier ist das Geld, das du haben wolltest.';
            responseText = 'Ausgezeichnet, das Geld ist genau richtig.';
        } else if (mission.missionType === 'steal_vehicle') {
            dialogText = 'Ich habe das Fahrzeug besorgt, wie du wolltest.';
            responseText = 'Das ist ein schönes Fahrzeug, gute Arbeit!';
        }
        
        // Dialogoptionen erstellen
        const menuOptions = [
            {
                id: 'turn_in_item',
                header: dialogText,
                txt: `Auftrag "${mission.title}" abschließen`,
                icon: 'fas fa-handshake',
                params: {
                    event: 'crime-npc:turnInMission',
                    args: {
                        missionId: mission.id
                    }
                }
            },
            {
                id: 'not_yet',
                header: 'Ich bin noch nicht fertig',
                txt: 'Zurück zur Mission gehen',
                icon: 'fas fa-arrow-left',
                params: {
                    event: 'qb-menu:client:closeMenu'
                }
            }
        ];
        
        // Menu öffnen mit hideFooter Option
        exports['qb-menu'].openMenu(menuOptions, { hideFooter: true });
        
        console.log(`[NBA-MrCrime] Übergabe-Dialog für Mission ${mission.id} geöffnet`);
    }

    /**
     * Generische Methode zum Öffnen eines Menüs
     */
    private openMenu(menuItems: MenuOption[], hideFooter: boolean = true): void {
        if (typeof exports['qb-menu']?.openMenu === 'function') {
            // Parameter für qb-menu - standardmäßig hideFooter: true verwenden
            const menuConfig = { hideFooter: true };
            exports['qb-menu'].openMenu(menuItems, menuConfig);
        } else {
            console.error('[NBA-MrCrime] qb-menu nicht gefunden!');
            emit('QBCore:Notify', {
                text: 'Fehler beim Öffnen des Menüs',
                type: 'error',
                length: 3000
            });
        }
    }
} 