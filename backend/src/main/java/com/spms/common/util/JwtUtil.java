package com.spms.common.util;

import com.spms.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT utility — HS256, 30-minute access tokens.
 * Claims embedded: sub (username), userId (Long), role (String).
 * Secret is loaded from jwt.secret in application.properties.
 */
@Slf4j
@Component
public class JwtUtil {

    /** 30 minutes in milliseconds */
    private static final long TOKEN_EXPIRY_MS = 30L * 60 * 1000;

    @Value("${jwt.secret}")
    private String secret;

    // ── Token Generation ──────────────────────────────────────

    /**
     * Generate a signed JWT for the given User entity.
     * Extra claims: userId, role.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role",   user.getRole().name());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRY_MS))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Token Validation ──────────────────────────────────────

    /**
     * Returns true if the token signature is valid and it has not expired.
     */
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);   // throws on invalid signature / expiry
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    // ── Claims Accessors ──────────────────────────────────────

    /** Returns the username (subject) embedded in the token. */
    public String getUsernameFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Returns the userId claim (Long) embedded in the token. */
    public Long getUserIdFromToken(String token) {
        Number id = extractClaim(token, claims -> claims.get("userId", Integer.class));
        return id == null ? null : id.longValue();
    }

    /** Returns the role claim (String) embedded in the token, e.g. "ADMIN". */
    public String getRoleFromToken(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /** Token expiry in seconds — used in AuthResponse.expiresIn. */
    public long getExpirySeconds() {
        return TOKEN_EXPIRY_MS / 1000;
    }

    // ── Internal Helpers ──────────────────────────────────────

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
