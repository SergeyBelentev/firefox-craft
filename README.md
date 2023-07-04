# Firefox Craft
Adds support for tab-dependent contextual use of crown in Firefox for Logitech Craft Keyboard

# Features
Added context support for Crown in Youtube player.
![Youtube Crown context](https://i.imgur.com/KvYvCFE.png)

Tab switching for other web sites has been saved.
![Websites Crown context](https://i.imgur.com/DxW75Mi.png)

# Installation
## 1. What You'll Need (Requirements)

To get started on creating your own Craft plugin, you would need the following components connected and installed.

- **[Logitech Craft Advanced Keyboard](https://www.logitech.com/product/craft)**

 ![](assets/craft.png)

- **[Logitech Options](http://support.logitech.com/software/options)** <br/>
 Version 6.80 or above

 Currently Logitech Options supports the following platforms:

 Platform | Version
 :--- | :---
 Microsoft Windows|Windows 7 and above

- **Port availability** <br/>
Communication between Logitech Options and plugins happens via port `10134`.
It is important to ensure there are no conflicts with this port and it is available for Logitech Options to use.

## 2. Copy `Firefox Craft` plugin to Logitech Options plugins folder
Go to Logitech Options plugins folder . `(C:\ProgramData\Logishrd)`.
Copy `LogiOptionsPlugins` folder (from this repository) into the `(C:\ProgramData\Logishrd)` folder.
![image](assets/manifest_folder.PNG)

## 3. Enable Developer Mode

Start **Logitech Options** and click **Craft Advanced Keyboard**.

![image](assets/keyboard.PNG)

Click `MORE SETTINGS`.

![image](assets/more_settings.PNG)

Click `ENABLE` button from the **Developer Mode** section.

![image](assets/software.PNG)

## 4. Delete `Mozilla Firefox` from `All Applications`

![image](https://i.imgur.com/KcFLMIA.png)

## 5. Reload PC (Or kill all process of `Logitech Options` and start them)

## 6. Start `firefox_craft_proxy.exe`
![image](https://i.imgur.com/dFtS0wp.png)

## 7. Add `Firefox Craft` Application in `Logitech Options`
![image](https://i.imgur.com/4BPJ4kF.png)
![image](https://i.imgur.com/g3S9RtN.png)
### Important! Uncheck `Mozilla Firefox` and check `Firefox Craft`!
![image](https://i.imgur.com/lkhT57k.png)

## 8. Install `Firefox Craft` Firefox extension
Open Firefox.
Go to `about:addons`.
Click on `setting` button.
![image](https://i.imgur.com/iZqIkB8.png)
Choice `install from file`.
Select `firefox-extension.zip` (from this repository)

## 9. Done. Try to use Crown in any Youtube video.

# Compiling `firefox_craft_proxy.py`
1. Create virtual env: `python -m venv env`
2. Activate env: `./env/Scripts/activate`
3. Install `requirements.txt`: `pip install -r requirements.txt`
4. In `websocket-client` change `_handshake.py` (`.\env\Lib\site-packages\websocket\_handshake.py`) change `VERSION` to `VERSION=8`
5. build: `pyinstaller firefox_craft_proxy.py -y`

# Why we need to use `firefox_craft_proxy.py/exe`?
Because for Logitech Craft SDK we must send PID in `register` stage.