// src/main/java/com/ewaste/dto/JwtResponse.java

package com.ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor // This generates the constructor for all 5 fields now
@NoArgsConstructor
public class JwtResponse {

    // The fields must now match the 5 arguments in AuthService:
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String role;
    private String email; // <<< CRITICAL FIX: ADD THE MISSING FIELD
}