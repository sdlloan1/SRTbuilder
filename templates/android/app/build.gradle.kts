plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "{{app.androidPackage}}"
    compileSdk = {{app.targetSdk}}

    defaultConfig {
        applicationId = "{{app.androidPackage}}"
        minSdk = {{app.minSdk}}
        targetSdk = {{app.targetSdk}}
        versionCode = {{app.buildNumber}}
        versionName = "{{app.version}}"
        resValue("string", "app_name", "{{app.displayName}}")
    }

    buildFeatures { buildConfig = true }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}
