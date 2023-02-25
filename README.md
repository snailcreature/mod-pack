# `modpack-pack`

Unofficial tool to create server and client modpack folders for CurseForge Minecraft Modpacks.

Install by running `npm i -g modpack-pack`.

## Step 1: Make your modpack

Create a custom Minecraft Forge modpack using the Curse launcher. Test your modpack thoroughly.

**`modpack-pack` uses the `minecraftinstance.json` file generated when you play modded Minecraft to create its listings and files.**

## Step 2: Initialise `modpack-pack`

Open your modpack's directory in a terminal window and run `mod-pack init`. This will create a `mod-pack.conf.json` file based on the Minecraft instance.

## Step 3: Configure `modpack-pack`

Open the `mod-pack.conf.json` file and check that all the information you need is included and correct.

```javascript
{
  "name": "Modpack Name", // Name of the modpack
  "mp_version": "1.0.0", // Modpack version
  "server_version": "1.0.0", // Modpack serverpack version
  "minecraft_version": "1.0.0", // Vanilla Minecraft version
  "forge_version": "1.0.0", // Forge version
  "includes": [
    "/config"
  ],
  "modlist": [],
  "resourcepacks": []
}
```

### `includes`

This is the list of directories that you would like copying to the compressed modpack.

```javascript
{//...
"includes": [
  "/config",
  "/kubejs"
]
//...
}
```

### `modlist` and `resourcepacks`

This is the list of mods you have installed in your modpack. `modlist.mod.installType` is the only value you should manually change, as it tells `mod-pack` which versions of the modpack to include the mod in. It should be set to `"both"` by default, but can be changed to `"server"` or `"client"`.

```javascript
{//...
  "modlist": [
    {
      {
        "name": "Just Enough Items (JEI)", // Name of the mod
        "author": "mezz", // Registered author of the mod
        "url": "https://www.curseforge.com/minecraft/mc-mods/jei", // CurseForge URL of the mod
        "projectId": 238222, // CurseForge project ID
        "filename": "jei-1.18.2-forge-10.2.1.1002.jar", // The installed file
        "fileId": 4352925, // The ID of the file
        "installType": "both" // Whether the mod should be installed on the "client", the "server", or "both"
      }
    }
  ]
//...
}
```

`resourcepacks` is the same but for Minecraft resource packs. The format is the same as in `modlist`, but without an `installtype`: All resource packs are installed on the client and the server.

```javascript
{//...
  "resourcepacks": [
    {
      "name": "Health Indications", // Resource pack name
      "author": "DanMizu", // Registered author
      "url": "https://www.curseforge.com/minecraft/texture-packs/health-indications", // Curseforge URL
      "projectId": 585361, // CurseForge project id
      "filename": "Health Indications v2.2 1.18.zip", // Installed filename
      "fileId": 3735943 // CurseForge file ID
    }
  ]
//...
}
```

## Step 4: Update `modpack-pack`

Let's say you have played your modpack a little more before deciding to build it and publish it on CurseForge. You've removed some mods, updated a few, and added a couple more. Run `mod-pack update` to update the config file on your modpack.

## Step 5: Build `modpack-pack`

Run `mod-pack build` to compress your modpack. The result will be 2 directories and 2 zip files, one of each for the client version that will be installed by the CurseForge Client and for the serverpack version that can also be uploaded to CurseForge.