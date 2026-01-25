// src/main/java/com/ewaste/config/ResourceConfig.java

package com.ewaste.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🟢 FIX: Map the URL path /uploads/** to the local 'uploads/' directory

        // 1. Map the URL path
        registry.addResourceHandler("/uploads/**")
                // 2. Map to the physical directory (needs 'file:' prefix and absolute path)
                .addResourceLocations("file:uploads/"); // Assuming 'uploads' folder is in project root
    }
}