package com.spms.auth.service;

import com.spms.auth.dto.AdminResetPasswordRequest;
import com.spms.auth.dto.ChangePasswordRequest;
import com.spms.auth.dto.UpdateProfileRequest;
import com.spms.auth.dto.UserMapper;
import com.spms.auth.dto.UserSummaryDto;
import com.spms.auth.entity.User;
import com.spms.auth.repository.UserRepository;
import com.spms.common.enums.AccountStatus;
import com.spms.common.exception.SpmsException;
import com.spms.common.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User management service — profile updates, password changes, admin operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserSummaryDto getMe(String username) {
        return UserMapper.toSummary(findByUsername(username));
    }

    @Transactional
    public UserSummaryDto updateProfile(String username, UpdateProfileRequest req) {
        User user = findByUsername(username);

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            ValidationUtils.validateEmail(req.getEmail());
            if (!req.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(req.getEmail())) {
                throw new SpmsException("Email already in use", HttpStatus.CONFLICT);
            }
            user.setEmail(req.getEmail());
        }

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            ValidationUtils.validatePhone(req.getPhone());
            user.setPhone(req.getPhone());
        }

        if (req.getVehicleType() != null)   user.setVehicleType(req.getVehicleType());
        if (req.getVehicleNumber() != null) user.setVehicleNumber(req.getVehicleNumber());

        return UserMapper.toSummary(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new SpmsException("New password and confirmation do not match",
                    HttpStatus.BAD_REQUEST);
        }
        User user = findByUsername(username);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new SpmsException("Current password is incorrect", HttpStatus.UNAUTHORIZED);
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user '{}'", username);
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> listAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toSummary);
    }

    @Transactional
    public UserSummaryDto activateUser(Long id) {
        User user = findById(id);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        log.info("Admin activated user id={}", id);
        return UserMapper.toSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryDto deactivateUser(Long id) {
        User user = findById(id);
        user.setAccountStatus(AccountStatus.INACTIVE);
        log.info("Admin deactivated user id={}", id);
        return UserMapper.toSummary(userRepository.save(user));
    }

    @Transactional
    public void adminResetPassword(Long id, AdminResetPasswordRequest req) {
        if (req.newPassword() == null || req.newPassword().length() < 6) {
            throw new SpmsException("New password must be at least 6 characters",
                    HttpStatus.BAD_REQUEST);
        }
        User user = findById(id);
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        log.info("Admin reset password for user id={}", id);
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> SpmsException.notFound("User", username));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> SpmsException.notFound("User", id));
    }
}
