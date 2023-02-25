const fs = require('fs');
const { SingleBar, Presets } = require('cli-progress');

const cwd = process.cwd();

const options = {
  "name": "Modpack Name",
  "mp_version": "1.0.0",
  "server_version": "1.0.0",
  "minecraft_version": "1.0.0",
  "forge_version": "1.0.0",
  "gameID": 432,
  "includes": [
    "/config"
  ],
  "modlist": [],
  "resourcepacks": [],
}

if (fs.existsSync(cwd + '/minecraftinstance.json') && !fs.existsSync(cwd + '/mod-pack.conf.json')) {
  console.log('Minecraft Instance found in', cwd);

  fs.readFile(cwd + '/minecraftinstance.json', 'utf-8', (err, data) => {
    if (err) console.warn(err);
    else {
      const instance = JSON.parse(data);

      options.minecraft_version = instance.baseModLoader.minecraftVersion;
      console.log('Found Minecraft version', instance.baseModLoader.minecraftVersion);

      options.forge_version = instance.baseModLoader.forgeVersion;
      console.log('Found Forge version', instance.baseModLoader.forgeVersion);

      const progBar = new SingleBar({
        format: 'Discovering Mods | {bar} | {percentage}% || {value}/{total} Mods'
      }, Presets.shades_classic);
      progBar.start(instance.installedAddons.length, 0);
      instance.installedAddons.forEach((mod) => {
        if (mod.packageType == 3) {
          options.resourcepacks.push({
            "name": mod.name,
            "author": mod.primaryAuthor,
            "url": mod.webSiteURL,
            "projectId": mod.addonID,
            "filename": mod.installedFile.fileName,
            "fileId": mod.installedFile.id,
          });
        } else {
          options.modlist.push({
            "name": mod.name,
            "author": mod.primaryAuthor,
            "url": mod.webSiteURL,
            "projectId": mod.addonID,
            "filename": mod.installedFile.fileName,
            "fileId": mod.installedFile.id,
            "installType": "both",
          });
        }
        progBar.increment();
      });
      progBar.stop();
      console.log('All mods found!');
      fs.writeFile(cwd + '/mod-pack.conf.json', JSON.stringify(options), (err) => {
        if (err) console.warn('Initialisation failed with error', err);
        else console.log('Initialisation complete!')
      });
    }
  });
}
else if (fs.existsSync(cwd + '/mod-pack.conf.json')) console.warn('You have already initialised! Try running: mod-pack update');
else console.warn('No Minecraft Instance');