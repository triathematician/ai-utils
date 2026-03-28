plugins {
    kotlin("jvm") version "1.9.23"
    application
    id("io.ktor.plugin") version "2.3.10"
}

application {
    mainClass.set("ProxyKt")
}

repositories { mavenCentral() }

dependencies {
    implementation("io.ktor:ktor-server-netty:2.3.10")
    implementation("io.ktor:ktor-server-core:2.3.10")
    implementation("io.ktor:ktor-server-cors:2.3.10")
    implementation("io.ktor:ktor-client-core:2.3.10")
    implementation("io.ktor:ktor-client-cio:2.3.10")
    implementation("ch.qos.logback:logback-classic:1.4.14")
}
