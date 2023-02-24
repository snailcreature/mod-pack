const fs = require('fs');
const { SingleBar, Presets } = require('cli-progress');

const cwd = process.cwd();

if (fs.existsSync(cwd + '/mod-pack.conf.json')) {
  if (fs.existsSync(cwd + '/minecraftinstance.json')) {
    console.log('Minecraft Instance found in', cwd);

    fs.readFile(cwd + '/mod-pack.conf.json', 'utf-8', (err, data) => {
      if (err) console.warn(err);
      else {
        let config = JSON.parse(data);
        fs.readFile(cwd + '/minecraftinstance.json', 'utf-8', (err, data) => {
          if (err) console.warn(err);
          else {
            let instance = JSON.parse(data);

            if (config.minecraft_version != instance.baseModLoader.minecraftVersion) {
              config.minecraft_version = instance.baseModLoader.minecraftVersion;
              console.log('Found new Minecraft version', instance.baseModLoader.minecraftVersion);
            }

            if (config.forge_version != instance.baseModLoader.forgeVersion) {
              config.forge_version = instance.baseModLoader.forgeVersion;
              console.log('Found new Forge version', instance.baseModLoader.forgeVersion);
            }

            // Find mods to add
            let toAdd = instance.installedAddons.filter(addon => !config.modlist.concat(config.resourcepacks).find(mod => addon.addonID == mod.projectId));
            console.log(`Found ${toAdd.length} new mods to add!`);

            // Finding mods to delete and update
            let progBar = new SingleBar({
              format: 'Scanning for Deletions and Updates | {bar} | {percentage}% || {value}/{total} Mods'
            }, Presets.shades_classic);
            progBar.start(instance.installedAddons.length, 0);
            let toDelete = [];
            let toUpdate = [];
            config.modlist.concat(config.resourcepacks).forEach((mod) => {
              let searchResult = instance.installedAddons.find(element => mod.projectId == element.addonID);
              if (!searchResult) toDelete.push(mod);
              else if (mod.fileId != searchResult.installedFile.id) toUpdate.push(mod);
              progBar.increment();
            });
            progBar.stop()

            // Deleting mods
            if (toDelete.length > 0) {
              progBar = new SingleBar({
                format: 'Deleting Mods | {bar} | {percentage}% || {value}/{total} Mods'
              }, Presets.shades_classic);
              progBar.start(toDelete.length, 0);
              toDelete.forEach((mod) => {
                config.modlist = config.modlist.filter(element => element.projectId != mod.projectId);
                progBar.increment();
              });
              progBar.stop();
            }
            
            // Update mod files
            if (toUpdate.length > 0) {
              progBar = new SingleBar({
                format: 'Updating Mods | {bar} | {percentage}% || {value}/{total} Mods'
              }, Presets.shades_classic);
              progBar.start(toUpdate.length, 0);
              toUpdate.forEach((mod) => {
                let newMod = instance.installedAddons.find(element => mod.projectId == element.addonID);
                mod.fileId = newMod.installedFile.id;
                mod.filename = newMod.installedFile.fileName;
                progBar.increment();
              });
              progBar.stop();
            }

            // Add new mods
            if (toAdd.length > 0) {
              progBar = new SingleBar({
                format: 'Adding Mods | {bar} | {percentage}% || {value}/{total} Mods'
              }, Presets.shades_classic);
              progBar.start(toAdd.length, 0);
              toAdd.forEach((mod) => {
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
            }

            console.log('Update complete!');
          }
        });
      }
    });
  } else {
    console.warn('No Minecraft Instance');
  }
} else {
  console.warn('Config file not found. Try running: mod-pack init');
}