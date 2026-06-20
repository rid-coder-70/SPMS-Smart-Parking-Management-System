package com.spms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpmsApplication.class, args);
    }
}
