package com.spms.audit.service;

import com.spms.audit.entity.AuditLog;
import com.spms.audit.repository.AuditLogRepository;
import com.spms.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String actionType, String targetEntity, String details) {
        Long adminId = SecurityUtils.getCurrentUserId();
        String adminUsername = SecurityUtils.getCurrentUsername();

        auditLogRepository.save(AuditLog.builder()
                .adminId(adminId != null ? adminId : 0L)
                .adminUsername(adminUsername != null ? adminUsername : "SYSTEM")
                .actionType(actionType)
                .targetEntity(targetEntity)
                .details(details)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(String actionType, Pageable pageable) {
        if (actionType != null && !actionType.isBlank()) {
            return auditLogRepository.findByActionTypeOrderByTimestampDesc(actionType, pageable);
        }
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
