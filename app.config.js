module.exports = {
  name: "Beluga Fit",
  slug: "beluga-fit",
  version: "1.0.0",
  sdkVersion: "51.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tranbtc.belugafitworkout",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.tranbtc.belugafitworkout",
    compileSdkVersion: 35,
    targetSdkVersion: 35
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          kotlinVersion: "2.0.21"
        }
      }
    ]
  ],
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "322e2792-29c9-4977-ad75-f5e21def0be4"
    }
  }
};