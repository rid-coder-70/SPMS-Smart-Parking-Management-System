package com.spms.auth.entity;

import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import com.spms.common.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Core User entity — implements UserDetails for direct Spring Security integration.
 * Package: com.spms.auth.entity
 * Other modules reference users by userId (Long) only; they must NOT import this entity.
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    // ── Primary Key ───────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identity ──────────────────────────────────────────────
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    // ── Vehicle Info ──────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VehicleType vehicleType;

    @Column(length = 20)
    private String vehicleNumber;

    // ── Role & Status ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    // ── Account Lock ──────────────────────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    @Column
    private LocalDateTime lockedUntil;   // null → not locked by time

    // ── Audit ─────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

    // ── UserDetails impl ─────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Spring Security uses getUsername() as the login identifier. */
    @Override public String  getUsername()              { return username; }

    /** Spring Security calls getPassword(); we store BCrypt hash here. */
    @Override public String  getPassword()              { return passwordHash; }

    @Override public boolean isAccountNonExpired()      { return true; }

    @Override public boolean isAccountNonLocked() {
        // If status is LOCKED and lockedUntil is still in the future → locked
        if (accountStatus == AccountStatus.LOCKED) {
            return lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil);
        }
        return true;
    }

    @Override public boolean isCredentialsNonExpired()  { return true; }

    @Override public boolean isEnabled()                { return accountStatus == AccountStatus.ACTIVE; }
}
