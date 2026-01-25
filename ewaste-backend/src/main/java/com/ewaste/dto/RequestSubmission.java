// src/main/java/com/ewaste/dto/RequestSubmission.java

package com.ewaste.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestSubmission {

    @NotBlank
    private String deviceType;

    private String brand;
    private String model;


    @NotBlank
    private String deviceCondition;

    @NotNull
    private Integer quantity;

    private String imagePaths;

    @NotBlank
    private String pickupAddress;

    private String remarks;
}