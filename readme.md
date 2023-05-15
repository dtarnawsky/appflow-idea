# Appflow Concept
Customers have issues with AppFlow including:
- Not being able to connect their source repo to AppFlow because of Company security concerns
- Not being able to connect their source repo to AppFlow because App Flow does not support their VSC (eg Mercurial, TFS)
- Not being able to use an internal dependency proxy like Artifactory due to required exposure to the internet
- Not being comfortable with exposing their source code outside their network

## Idea
Allow customers to build the web part of their app and then send over the built web assets and native project to Ionic, use AppFlow to build the native project + compiled web assets and return the IPA/AAB/APK.

The customer can do this through their CI system (eg Jenkins etc) or even on a developer machine via CLI.

## How?
On your Local CI (or Dev) machine: Compress the `ios` or `android` folder as well as needed `node_modules` folders into a single file then upload the file to a temporary area on the web.

## Proof Of Concept
In this repo you can copy your Ionic project to a folder called `files`, then run `node index.js files`. This creates the file `app.tar.xz`. You can upload this with `curl --upload--file ./app.tar.xz https://transfer.sh/app.tar.xz`

## In Appflow:
Create a new app using the new native iOS and Android types. Your GitHub repo only requires one file: `appflow.config.json`:
```json
{
    "apps":
    [
        {
            "appId": "c2d4abd6",
            "root": ".",
            "dependencyInstallCommand": "curl https://transfer.sh/xHRLjU/app.tar.xz --output app.tar.xz && tar -xJf app.tar.xz",
            "webBuildCommand": "<web_build_cmd>",
            "iosPath": "files/ios/App",
            "androidPath": "<android_path>"
        }        
    ]
}
```

App Flow can now build the application.

## Notes
The script described below could be a Ionic Cloud CLI command:

- `index.js` iterates over node_modules and finds Cordova and Capacitor plugins and creates the list of files to compress (in `tar-include.txt`).
- To upload we use `curl` with `--upload-file`. A temporary area is needed, for the POC I used (transfer.sh)[https://transfer.sh] but you would use an Ionic server that uploads to a location and returns the url to the uploaded file.
- As we would get a random url for each uploaded file, you could pass the url as an environment variable. That way the github repo does not change.

## Vision
Imagine using `ionic-cloud send ios` to take your existing Ionic project, create the necessary app-id, native build, compress and send the necessary files to Appflow. It would create/copy `appflow.config.json` so that you not need to hook your app up to a github repo. It could take a `--comment` argument to allow passing in information about the build such as the internal commit id, or comment.
