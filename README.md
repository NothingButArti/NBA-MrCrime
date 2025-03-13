
## Übersicht
NBA-MrCrime ist eine modulare Ressource, die einen kriminellen NPC ("Mr Crime") implementiert, der Spielern verschiedene illegale Aufträge anbietet. Das System unterstützt verschiedene Missionstypen, interaktive Dialoge und ein Belohnungssystem.

## Projektstruktur
Das Projekt ist in folgende Hauptbereiche unterteilt:

### Client-Bereich (`client/`)
Enthält den clientseitigen Code

```
client/
├── src/
│   ├── client.ts               # Haupteinstiegspunkt
│   ├── missionController.ts    # Verarbeitung verschiedener Missionstypen
│   └── modules/                # Modulare Komponenten
│       ├── npcManager.ts       # NPC-Spawning und Verwaltung
│       ├── menuManager.ts      # Dialog- und Menüsystem
│       ├── missionManager.ts   # Missionsfortschritts-Tracking
│       └── utils.ts            # Hilfsfunktionen
```

**client.ts** initialisiert das System und registriert Events. Es dient als zentraler Einstiegspunkt für die Client-Logik.

**npcManager.ts** kümmert sich um:
- Spawnen des NPCs an konfigurierten Koordinaten
- Verhindern, dass der NPC wegläuft oder despawnt
- Hinzufügen der Interaktionsmöglichkeiten zum NPC

**menuManager.ts** verwaltet:
- Die Hauptmenüs für NPC-Interaktionen
- Missions-Auswahldialoge
- Item-Abgabe-Dialoge für Missionsabschluss

**missionManager.ts** steuert:
- Missionsfortschritt und Zustände
- Wegpunkte und Blips für Missionsziele
- Item-Sammlung und Abgabe-Logik

### Server-Bereich (`server/`)
Enthält serverseitigen Code für Belohnungen und Sicherheitsvalidierung:

```
server/
└── src/
    └── server.ts              # Server-Logik
```

**server.ts** übernimmt:
- Validierung von Spieleraktionen
- Vergabe von Belohnungen
- Item-Management
- Speicherung aktiver Missionen

### Shared-Bereich (`shared/`)
Enthält gemeinsam genutzte Definitionen und Konfigurationen:

```
shared/
├── config.ts                  # Konfiguration und Missionsdefinitionen
└── types.ts                   # TypeScript-Typdefinitionen
```

## Konfiguration und Anpassung

### NPC-Konfiguration
Der NPC wird in `shared/config.ts` konfiguriert:

```typescript
export const NPC_CONFIG = {
    coords: { 
        x: 123.87, 
        y: -1082.22, 
        z: 29.19, 
        heading: 90.0 
    },
    model: 's_m_y_dealer_01',
};
```

### Missionen erstellen
Missionen werden im `MISSIONS`-Array in `shared/config.ts` definiert:

```typescript
export const MISSIONS = [
    {
        id: "steal_statue_1",          // Eindeutige ID
        title: "Statue stehlen",     // Titel im Menü
        description: "Stiehl eine wertvolle Statue", // Beschreibung
        missionType: "steal_item",   // Missionstyp
        location: {                  // Zielort
            x: 234.5, 
            y: 789.2, 
            z: 30.1
        },
        data: {                      // Missionstyp-spezifische Daten
            itemName: "stolen_statue", // Inventar-Item-Name
            itemLabel: "Kunststatue",  // Anzeigename
            itemModel: "prop_idol_01" // Porp whatever
        },
        reward: {                    // Belohnungen
            money: 1500,             // Geldbelohnung
            xp: 100,                 // XP-Belohnung
            items: []                // Item-Belohnungen (optional)
        }
    },
    // Weitere Missionen hier einfügen...
];
```

### Unterstützte Missionstypen
Das System unterstützt diese Missionstypen:

1. **steal_item**: Gegenstände stehlen und zurückbringen
   ```typescript
   data: {
     itemName: "item_name",     // Name im Inventarsystem
     itemLabel: "Item Name",    // Anzeigename für Spieler
     itemModel: "prop_cs_package_01"  // 3D-Modell des Gegenstands
   }
   ```

2. **steal_money**: Geld stehlen und zurückbringen
   ```typescript
   data: {
     amount: 5000  // Menge des zu stehlenden Geldes
   }
   ```

3. **steal_vehicle**: Fahrzeug stehlen und abliefern
   ```typescript
   data: {
     vehicle: "sultanrs"  // Fahrzeugmodell
   }
   ```

4. **robbery**: Einen Ort ausrauben
   ```typescript
   data: {
     // Spezifische Raubdaten je nach Implementierung
   }
   ```

## Mit dem System arbeiten

### Neue Mission hinzufügen
Um eine neue Mission hinzuzufügen:

1. Öffne `shared/config.ts`
2. Füge einen neuen Eintrag zum `MISSIONS`-Array hinzu:

```typescript
{
    id: "jewel_heist",                   // Eindeutige ID
    title: "Juwelier ausrauben",         // Anzeigetitel
    description: "Raube den Juwelier in der Innenstadt aus",
    missionType: "robbery",              // Missionstyp
    location: { x: 132.6, y: -812.0, z: 31.4 },  // Zielort
    data: {
        // Spezifische Daten je nach Missionstyp
    },
    reward: {
        money: 3500,
        xp: 200,
        items: [
            { name: "diamond", amount: 2 }  // Optionale Item-Belohnungen
        ]
    }
}
```

3. Speichere die Datei und kompiliere das Projekt mit:
```bash
yarn build
# oder
npm run build
```

4. Starte die Ressource neu

### Eigenen Missionstyp erstellen
Um einen neuen Missionstyp zu implementieren:

1. Erweitere die `missionController.ts`, um die neue Missionslogik zu implementieren:

```typescript
/**
 * Verarbeitet den neuen Missionstyp
 */
function handleCustomMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    if (step === MissionStep.GOTO_LOCATION) {
        // Logik für Ankunft am Missionsort
        showNotification("Du hast den Ort erreicht. Beginne deine Aufgabe.", 'primary');
    } else if (step === MissionStep.COLLECT_ITEM) {
        // Spezifische Logik für die Sammelphase
        // z.B. spawnMissionObject(mission);
    } else if (step === MissionStep.RETURN_TO_NPC) {
        // Logik für Rückkehr zum NPC
        showNotification("Kehre zu Mr Crime zurück.", 'primary');
    }
}
```

2. Füge den neuen Typ zur Hauptfunktion in `handleMissionProgress` hinzu:

```typescript
export function handleMissionProgress(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    switch (mission.missionType) {
        case 'steal_item':
            handleItemMission(mission, step);
            break;
        // Weitere bestehende Typen...
        
        case 'custom_mission_type':
            handleCustomMission(mission, step);
            break;
            
        default:
            console.error(`[NBA-MrCrime] Unbekannter Missionstyp: ${mission.missionType}`);
    }
}
```

3. Aktualisiere bei Bedarf die serverseitige Logik in `server.ts`, um deinen neuen Missionstyp zu unterstützen

### Dialog-System anpassen
Um das Dialogsystem zu erweitern oder anzupassen:

1. Öffne `client/src/modules/menuManager.ts`
2. Füge einen neuen Dialog zur `showConversation`-Methode hinzu:

```typescript
public showConversation(dialogId: string): void {
    let menuItems: MenuOption[] = [];
    
    switch (dialogId) {
        case "about":
            // Bestehender Dialog...
            break;
            
        case "new_dialog":
            menuItems = [
                {
                    header: "Zurück",
                    icon: "fas fa-arrow-left",
                    params: { event: "crime-npc:openMenu" }
                },
                {
                    header: "Dialog-Titel",
                    txt: "Hier steht der Text des Dialogs...",
                    icon: "fas fa-comment",
                    isMenuHeader: true
                },
                // Weitere Dialog-Optionen...
            ];
            break;
    }
    
    this.openMenu(menuItems);
}
```

3. Rufe den Dialog auf, indem du das entsprechende Event auslöst:
```typescript
emit('crime-npc:conversation', { dialogId: 'new_dialog' });
```

### Menü-Optionen anpassen
Um das Hauptmenü anzupassen:

1. Öffne `client/src/modules/menuManager.ts`
2. Bearbeite die `openMainMenu`-Methode:

```typescript
public openMainMenu(): void {
    const menuItems: MenuOption[] = [
        {
            header: "Mr Crime",
            icon: "fas fa-user-secret",
            isMenuHeader: true
        },
        // Bestehende Optionen...
        
        // Neue Option hinzufügen
        {
            header: "Neue Option",
            txt: "Beschreibung der neuen Option",
            icon: "fas fa-icon-name", // FontAwesome Icon
            params: {
                event: "crime-npc:custom-event",
                args: { customData: "wert" }
            }
        }
    ];
    
    this.openMenu(menuItems);
}
```

## Troubleshooting

### NPC verschwindet oder läuft weg
Überprüfe die `setNPCProperties`-Methode in `npcManager.ts` und stelle sicher, dass folgende Eigenschaften gesetzt sind:

```typescript
// Als Mission Entity markieren
SetEntityAsMissionEntity(this.npcPed, true, true);
// Position fixieren
FreezeEntityPosition(this.npcPed, true);
// Unverwundbar machen
SetEntityInvincible(this.npcPed, true);
// Ereignisse blockieren
SetBlockingOfNonTemporaryEvents(this.npcPed, true);
// Fluchtattribute deaktivieren
SetPedFleeAttributes(this.npcPed, 0, false);
```

### Missionen werden nicht angezeigt
Wenn keine Missionen im Menü erscheinen:

1. Überprüfe die Konsole auf Fehlermeldungen
2. Stelle sicher, dass `setupGlobalConfig` in `shared/config.ts` korrekt aufgerufen wird und `globalThis.Config` auf die Missionen gesetzt wird
3. Prüfe, ob die Missionen korrekt im Array definiert sind
4. Verwende den Befehl `/mrcrime_reload`, um die Missionen neu zu laden

### Item-Abgabe funktioniert nicht
Wenn die Item-Abgabe beim NPC nicht funktioniert:

1. Überprüfe, ob das Event `crime-npc:turnInMission` korrekt registriert ist
2. Prüfe, ob der Spieler das entsprechende Item im Inventar hat
3. Stelle sicher, dass die `completeMission`-Methode im `missionManager` korrekt aufgerufen wird

## Entwicklung

### Installation der Abhängigkeiten
```bash
yarn install
# oder
npm install
```

### TypeScript kompilieren
```bash
yarn build
# oder
npm run build
```

### Entwicklung mit automatischem Neuladen
```bash
yarn watch
# oder
npm run watch
```

## Lizenz
MIT License

## Architektur und Zusammenspiel der Komponenten

### Datenfluss und Komponenten-Interaktion

Das NBA-MrCrime-System ist modular aufgebaut und folgt einem klaren Datenfluss:

1. **Initialisierung**: 
   - `client.ts` startet die Ressource mit dem `initializeResource()`-Aufruf
   - Die Konfiguration wird aus `shared/config.ts` geladen
   - NPCManager, MenuManager und MissionManager werden instanziiert

2. **Event-basierte Kommunikation**:
   - Die Module kommunizieren über ein Event-System miteinander
   - `client.ts` registriert alle Events mit `registerEvents()`
   - Events wie `crime-npc:showMissions` oder `crime-npc:collectMissionItem` steuern den Ablauf

3. **Missionslebenszyklus**:
   ```
   Spieler ↔ NPCManager (Interaktion) → MenuManager (Auswahl) → MissionManager (Tracking)
   → missionController.ts (Logik) ↔ Server (Validierung/Belohnungen)
   ```

### Detailliertes Zusammenspiel

#### NPC-Interaktion und Menüsystem
1. Der `NPCManager` spawnt den NPC und fügt eine `qb-target`-Interaktion hinzu
2. Bei Interaktion wird das Event `crime-npc:openMenu` ausgelöst
3. `MenuManager` fängt dieses Event ab und öffnet das Hauptmenü
4. Nach Auswahl einer Mission wird `crime-npc:startMission` ausgelöst
5. `MissionManager` startet die Mission und aktualisiert den Zustand

#### Missionsdurchführung
1. `MissionManager` setzt Wegpunkte und überwacht den Spielerfortschritt
2. Bei Erreichen des Ziels wird der Missionsschritt auf `COLLECT_ITEM` gesetzt
3. `missionController.ts` spawnt Objekte oder führt missionstyp-spezifische Logik aus
4. Nach Sammeln wird `crime-npc:collectMissionItem` ausgelöst
5. Der Spieler kehrt zum NPC zurück und gibt die Items ab

#### Server-Client-Kommunikation
1. Kritische Aktionen wie Missionsstart oder Item-Sammlung werden an den Server gesendet
2. `server.ts` validiert Aktionen und verwaltet aktive Missionen
3. Bei Missionsabschluss vergibt der Server Belohnungen und benachrichtigt den Client

## Erweitern des Systems

### Eigene Missionssätze erstellen

Um eigene Missionssätze zu erstellen, ohne die Kernkonfiguration zu ändern:

1. Erstelle eine neue Datei `mymissions.ts` im Format:

```typescript
import { MissionTypes } from '@shared/types';

export const MY_MISSIONS: MissionTypes.CrimeMission[] = [
    // Deine Missionen hier
];

// Registriere die Missionen beim Resource-Start
on('onResourceStart', (resourceName: string) => {
    if (GetCurrentResourceName() === resourceName) {
        exports('getCustomMissions', () => MY_MISSIONS);
    }
});
```

2. Importiere deine Missionen in der Hauptkonfiguration:

```typescript
// In shared/config.ts
try {
    const customMissions = exports['your-resource-name'].getCustomMissions();
    if (customMissions && Array.isArray(customMissions)) {
        MISSIONS = [...MISSIONS, ...customMissions];
    }
} catch (e) {
    console.log('Keine benutzerdefinierten Missionen gefunden');
}
```

### Erweiterte Missionstypen implementieren

Um komplexere Missionstypen zu implementieren:

1. **Typdefinition erweitern** in `shared/types.ts`:

```typescript
export namespace MissionTypes {
    export interface AdvancedMissionData extends BaseMissionData {
        stages: {
            target: { x: number, y: number, z: number },
            objective: string,
            requiresItem?: string
        }[],
        timeLimit?: number
    }
    
    export interface CrimeMission {
        // Bestehende Felder...
        missionType: 'steal_item' | 'steal_money' | 'steal_vehicle' | 'robbery' | 'advanced_mission',
        data: ItemMissionData | MoneyMissionData | VehicleMissionData | RobberyMissionData | AdvancedMissionData
    }
}
```

2. **Missionslogik implementieren** in `missionController.ts`:

```typescript
function handleAdvancedMission(mission: MissionTypes.CrimeMission, step: MissionStep): void {
    const data = mission.data as MissionTypes.AdvancedMissionData;
    const currentStage = missionManager.getCurrentStage();
    
    // Implementiere mehrstufige Missionslogik
    if (step === MissionStep.GOTO_LOCATION && currentStage < data.stages.length) {
        const stage = data.stages[currentStage];
        showNotification(`Ziel: ${stage.objective}`, 'primary');
        // Weitere Logik...
    }
}

// In handleMissionProgress() hinzufügen:
case 'advanced_mission':
    handleAdvancedMission(mission, step);
    break;
```

3. **MissionManager erweitern** für Mehrschritt-Missionen:

```typescript
// In missionManager.ts hinzufügen:
private currentStage: number = 0;

public getCurrentStage(): number {
    return this.currentStage;
}

public advanceStage(): void {
    this.currentStage++;
    // Implementiere Logik zum Fortschreiten der Mission
}
```

### Komplexere Dialogbäume und Missionsoptionen

Um verzweigte Dialogoptionen zu implementieren:

```typescript
// In menuManager.ts
public showComplexDialog(dialogId: string, options?: any): void {
    const dialogData = this.dialogTree[dialogId];
    
    if (!dialogData) {
        console.error(`[NBA-MrCrime] Dialog nicht gefunden: ${dialogId}`);
        return;
    }
    
    // Dynamisches Menü basierend auf vorherigen Entscheidungen
    const playerChoices = GetResourceKvpString('nba_mrcrime_choices') || '{}';
    const choices = JSON.parse(playerChoices);
    
    let menuItems = [
        {
            header: "Zurück",
            icon: "fas fa-arrow-left",
            params: { event: "crime-npc:openMenu" }
        }
    ];
    
    // Füge dynamische Optionen basierend auf Spielerwahlen hinzu
    dialogData.options.forEach(option => {
        if (option.requires && !this.checkRequirements(option.requires, choices)) {
            return; // Überspringe Optionen, die nicht den Anforderungen entsprechen
        }
        
        menuItems.push({
            header: option.text,
            txt: option.description || "",
            params: { 
                event: option.nextDialog ? 
                    "crime-npc:conversation" : 
                    option.event || "crime-npc:openMenu",
                args: option.nextDialog ? 
                    { dialogId: option.nextDialog } : 
                    option.args || {}
            }
        });
    });
    
    // Zeige das Menü
    exports['qb-menu'].openMenu(menuItems);
}
```



## Performance-Optimierungen


1. **Effiziente Ressourcennutzung**:
   - Reduziere die Tick-Rate in `missionManager.ts`, wenn keine Mission aktiv ist
   - Implementiere Distanz-basierte Updates statt konstanter Ticks

2. **Skalierbare Missionsdichte**:
   ```typescript
   // In server.ts
   const maxConcurrentMissions = GetConvarInt('nba_mrcrime_max_missions', 2);
   const activeMissions = new Map();
   
   // Limitiere aktive Missionen basierend auf Serverkapazität
   onNet('crime:server:startMission', (missionId) => {
       const source = global.source;
       
       if (activeMissions.size >= maxConcurrentMissions) {
           emitNet('QBCore:Notify', source, {
               text: 'Mr Crime hat derzeit keine aktiven Aufträge. Versuche es später noch einmal.',
               type: 'error'
           });
           return;
       }
       
       // Rest der Implementierung...
   });
   ```