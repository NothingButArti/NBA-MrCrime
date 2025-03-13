interface CrimeMissions {
    id: string;
    title: string;
    description: string;
    requiredLevel: number;
    hint: string;
    missionType: 'steal_item' | 'steal_money' | 'steal_weapon' | 'steal_vehicle' | 'robbery';
    reward: {
        money: number;
        xp: number;
        items?: { name: string; amount: number }[];
    };
    data: {
        itemName?: string;
        itemLabel?: string;
        itemDescription?: string;
        itemImage?: string;
        itemModel?: string;
        [key: string]: any;
    };
    location: {
        x: number;
        y: number;
        z: number;
    };
}

const missions: CrimeMissions[] = [
    {
        id: 'Mission_1',
        title: 'Hol mir meine Statue zurück',
        description: 'Der Kollege hat meine Statue gestohlen, hol die mir sofort zurück',
        hint: 'Ich glaube der Typ hat die am Stadtpark versteckt',
        requiredLevel: 0,
        missionType: 'steal_item',
        reward: {
            money: 150,
            xp: 2,
            items: [{ name: 'statue', amount: 1 }]
        },
        data: {
            itemName: 'statue',
            itemLabel: 'Statue',
            itemDescription: 'Eine Statue',
            itemImage: 'statue.png',
            itemModel: 'prop_idol_01'
        },
        location: {
            x: -260.0,    // Alta Street, nahe dem Stadtpark
            y: -964.0,
            z: 31.2
        }
    },
    {
        id: 'Mission_2',
        title: 'Besorg mir das Paket',
        description: 'Ein wichtiges Paket wurde am Strand zurückgelassen. Hol es für mich.',
        hint: 'Es sollte irgendwo am Vespucci Beach sein.',
        requiredLevel: 0,
        missionType: 'steal_item',
        reward: {
            money: 300,
            xp: 5
        },
        data: {
            itemName: 'package',
            itemLabel: 'Mysteriöses Paket',
            itemDescription: 'Ein verschlossenes Paket mit unbekanntem Inhalt',
            itemImage: 'package.png',
            itemModel: 'prop_drug_package_01'
        },
        location: {
            x: -1350.0,
            y: -1230.0,
            z: 4.0
        }
    },
    
];

(globalThis as any).Config = missions; 
