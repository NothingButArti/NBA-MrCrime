fx_version 'cerulean'
game 'gta5'

author 'NBA'
description 'FiveM TypeScript Boilerplate'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'dist/shared/config.js',
    'dist/shared/utils/*.js'
}

client_scripts {
    'dist/client/src/client.js',
}

server_scripts {
    'dist/server/src/server.js',
}

dependencies {
    'qb-target',
    'qb-menu',
    'qb-core',
    'ps-inventory'
}

-- Starte diese Resource nach den wichtigen System-Resources
resource_type 'gametype' { name = 'NBA-MrCrime' }