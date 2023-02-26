const fs = require('fs');
const fse = require('fs-extra');
const { SingleBar, Presets } = require('cli-progress');

console.log('Building...');

const cwd = process.cwd();

// Try opening directory, create if fail
fs.opendir(cwd + '/out', (err) => {
  if (err) {
    console.warn('Out directory does not exist. Creating...');
    fs.mkdir(cwd + '/out', () => {
    });
  }
  else console.log('out directory found!')
});

setTimeout(() => {}, 1000);

if (fs.existsSync(cwd + '/mod-pack.conf.json')) {
  console.log('mod-pack config file found in', cwd);

  fs.readFile(cwd + '/mod-pack.conf.json', 'utf-8', (err, data) => {
    if (err) console.warn('Build failed with error', err);
    else {
      const config = JSON.parse(data);

      let progBar = new SingleBar({
        format: '[CLIENT] Building manifest.json and modlist.html | {bar} | {percentage}% || {value}/{total} Mods'
      }, Presets.shades_classic)

      const manifest = {
        "minecraft": {
          "version": config.minecraft_version,
          "modLoaders": [
            {
              "id": `forge-${config.forge_version}`,
              "primary": true
            }
          ]
        },
        "manifestType": "minecraftModpack",
        "manifestVersion": 1,
        "name": config.name,
        "version": config.mp_version,
        "author": "",
        "files": [],
        "overrides": "overrides"
      }

      let modlistHtml = `<h1>${config.name} - Version ${config.mp_version}</h1>\n\n<ul>\n`;

      progBar.start(config.modlist.concat(config.resourcepacks).length, 0);
      config.modlist.concat(config.resourcepacks).forEach((mod) => {
        manifest.files.push({
          "projectID": mod.projectId,
          "fileID": mod.fileId,
          "required": true
        });

        modlistHtml += `<li><a href="${mod.url}">${mod.name} by ${mod.author}</a><li>\n`;

        progBar.increment();
      });
      modlistHtml += '</ul>';
      progBar.stop();

      setTimeout(() => {}, 1000);

      // Write client folder
      const foldername = `${config.name.replaceAll(/\s/g, '')}-${config.mp_version.replaceAll(/\s/g, '')}`;
      fs.opendir(cwd + `/out/${foldername}`, (err) => {
        if (err) {
          console.warn('Client directory does not exist. Creating...');
          fs.mkdir(cwd + `/out/${foldername}`, () => {});
        }
        else console.log('Client directory found!');

        fs.writeFile(cwd + `/out/${foldername}/manifest.json`, JSON.stringify(manifest), () => {
          console.log('manifest.json added to client!');
        });

        setTimeout(() => {}, 1000);

        fs.writeFile(cwd + `/out/${foldername}/modlist.html`, modlistHtml, () => {
          console.log('modlist.html added to client!');
        });

        setTimeout(() => {}, 1000);

        // Copy includes to client directory
        progBar = new SingleBar({
          format: '[CLIENT] Copying includes | {bar} | {percentage}% || {value}/{total} Directories'
        }, Presets.shades_classic);
        progBar.start(config.includes.length, 0);
        config.includes.forEach((dir) => {
          if (dir[0] == '.') dir = dir.slice(1);
          fs.opendir(cwd + '/' + dir, (err) => {
            if (err) console.warn(`Directory ${cwd + dir} does not exist.`);
            else {
              fs.mkdir(`${cwd}/out/${foldername}/${dir}`, ()=>{});
              setTimeout(() => {}, 500);
              fse.copy(cwd + dir, `${cwd}/out/${foldername}${dir}`,{ overwrite: true }, (err) => {
                if (err) console.error('Failed to copy directory', cwd + dir, 'to client');
              });
              setTimeout(() => {}, 500);
            }
          });
          progBar.increment();
        });
        progBar.stop();
        console.log('Includes copied!');

        // Create tutorials
        require('./metalsmith/rendertuts').writeTuts(foldername);

        setTimeout(() => {}, 1000);
      });

      setTimeout(() => {}, 5000);

      // Create serverpack
      const serverFoldername = foldername + `-server-${config.server_version.replaceAll(/\s/g, '')}`;
      fs.opendir(cwd + `/out/${serverFoldername}`, (err) => {
        if (err) {
          console.warn('Server directory does not exist. Creating...');
          fs.mkdir(cwd + `/out/${serverFoldername}`, () => {});

          setTimeout(() => {}, 500);
        }
        else console.log('Server directory found!');

        setTimeout(() => {}, 1000);

        fs.writeFile(cwd + `/out/${serverFoldername}/modlist.html`, modlistHtml, () => {
          console.log('modlist.html added to server!');
        });

        setTimeout(() => {}, 1000);

        fs.opendir(cwd + `/mods`, (err) => {
          if (err) console.error('No mods folder in', cwd);
          else {
            fs.opendir(cwd + `/out/${serverFoldername}/mods`, (err) => {
              if (err) {
                console.warn('Server mods directory does not exist. Creating...');
                fs.mkdir(cwd + `/out/${serverFoldername}/mods`, () => {});

                setTimeout(() => {}, 500);
              }
              else console.log('Server mods directory found!');
            });

            setTimeout(() => {}, 1000);

            let serverMods = config.modlist.filter(mod => mod.installType != 'client');
            fse.emptyDir(`${cwd}/out/${serverFoldername}/mods/`, () => {
              progBar = new SingleBar({
                format: '[SERVER] Copying mods | {bar} | {percentage}% || {value}/{total} Mods'
              }, Presets.shades_classic);
              progBar.start(serverMods.length, 0);
              serverMods.forEach((mod) => {
                fse.copy(`${cwd}/mods/${mod.filename}`, `${cwd}/out/${serverFoldername}/mods/${mod.filename}`, (err) => {
                  if (err) console.error(err);

                  setTimeout(() => {}, 500);
                });
                progBar.increment();
              });
              progBar.stop();
              console.log('[SERVER] Mods copied!');
            });

            setTimeout(() => {}, 1000);
          }
        });
        
        fs.opendir(cwd + `/resourcepacks`, (err) => {
          if (err) console.error('No resourcepacks folder in', cwd);
          else {
            fs.opendir(cwd + `/out/${serverFoldername}/resourcepacks`, (err) => {
              if (err) {
                console.warn('Server resourcepacks directory does not exist. Creating...');
                fs.mkdir(cwd + `/out/${serverFoldername}/resourcepacks`, () => {});

                setTimeout(() => {}, 500);
              }
              else console.log('Server resourcepacks directory found!');
            }, (err) => {
              if (err) console.error(err);
            });
            fse.emptyDir(`${cwd}/out/${serverFoldername}/resourcepacks/`, () => {
              fse.copy(cwd + `/resourcepacks`, `/out/${serverFoldername}/resourcepacks`, (err) => {
                if (err) console.error(err);
                else console.log('[SERVER] Resource packs copied!');
              });

              setTimeout(() => {}, 1000);
            });

            setTimeout(() => {}, 1000);
          }
        });

        // Copy includes to server directory
        progBar = new SingleBar({
          format: '[SERVER] Copying includes | {bar} | {percentage}% || {value}/{total} Directories'
        }, Presets.shades_classic);
        progBar.start(config.includes.length, 0);
        config.includes.forEach((dir) => {
          if (dir[0] == '.') dir = dir.slice(1);
          fs.opendir(cwd + dir, (err) => {
            if (err) console.warn(`Directory ${cwd + dir} does not exist.`);
            else {
              fs.mkdir(`${cwd}/out/${serverFoldername}${dir}`, ()=>{
                fse.copy(cwd + dir, `${cwd}/out/${serverFoldername}${dir}`, { overwrite: true }, (err) => {
                  if (err) console.error('Failed to copy directory', cwd + dir, 'to server');
                });
              });

              setTimeout(() => {}, 1000);
            }
          });
          progBar.increment();
        });
        progBar.stop();
        console.log('Includes copied to serverpack!');

        setTimeout(() => {}, 1000);
      });
    }
  });
}
else console.warn('No config file. Try running: mod-pack init');