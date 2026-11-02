package com.artistapp;

import java.util.TimeZone;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ArtistAppApplication {
    public static void main(String[] args) {
        // Las fechas se guardan con la hora local de la aplicación, igual que en la versión Laravel.
        String zone = System.getenv().getOrDefault("APP_TIMEZONE", "Europe/Madrid");
        TimeZone.setDefault(TimeZone.getTimeZone(zone));
        SpringApplication.run(ArtistAppApplication.class, args);
    }
}
