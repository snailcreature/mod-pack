const fs = require('fs');
const { SingleBar, Presets } = require('cli-progress');

const cwd = process.cwd();

const options = {
  "name": "Modpack Name",
  "mp_version": "1.0.0",
  "minecraft_version": "1.0.0",
  "forge_version": "1.0.0",
  "cf_api_key": "",
  "gameID": 432,
  "modlist": [],
  "resourcepacks": [],
}

if (fs.existsSync(cwd + '/minecraftinstance.json')) {
  console.log('Minecraft Instance found in', cwd);

  fs.readFile(cwd + '/minecraftinstance.json', 'utf-8', (err, data) => {
    if (err) console.warn(err);
    else {
      const instance = JSON.parse(data);

      options.minecraft_version = instance.baseModLoader.minecraftVersion;
      console.log('Found Minecraft version', instance.baseModLoader.minecraftVersion);

      options.forge_version = instance.baseModLoader.forgeVersion;
      console.log('Found Forge version', instance.baseModLoader.forgeVersion);

      const progBar = new SingleBar({}, Presets.shades_classic);
      progBar.start(instance.installedAddons.length, 0);
      instance.installedAddons.forEach((mod, index) => {
        if (mod.packageType == 3) {
          options.resourcepacks.push({
            "name": mod.name,
            "author": mod.primaryAuthor,
            "url": mod.webSiteUrl,
            "projectId": mod.addonID,
            "filename": mod.installedFile.fileName,
          });
        } else {
          options.modlist.push({
            "name": mod.name,
            "author": mod.primaryAuthor,
            "url": mod.webSiteUrl,
            "projectId": mod.addonID,
            "filename": mod.installedFile.fileName,
            "installType": "both",
          });
        }
        progBar.increment();
      });
      progBar.stop();
      console.log('All mods found!');
      fs.writeFile(cwd + '/mod-pack.conf.json', JSON.stringify(options), (err) => {
        if (err) console.log('Initialisation failed with error', err);
        else 
        console.log('Initialisation complete!')
      });
    }
  });
}

console.log('This is the init task.');