package Eventia.EventIA.event;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfigFile implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get("uploads/images/").toAbsolutePath().toString();
        System.out.println("Chemin absolu pour images: " + absolutePath);

        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}

