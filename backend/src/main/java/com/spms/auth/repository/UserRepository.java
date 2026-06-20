package com.spms.auth.repository;

import com.spms.auth.entity.User;
import com.spms.common.enums.AccountStatus;
import com.spms.common.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Admin list view — filterable by role and status
    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByAccountStatus(AccountStatus status, Pageable pageable);
}
