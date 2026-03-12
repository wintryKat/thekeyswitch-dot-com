package com.thekeyswitch.api.service;

import com.thekeyswitch.api.model.AdminUser;
import com.thekeyswitch.api.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBootstrapService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapService.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapUsername;
    private final String bootstrapPassword;

    public AdminBootstrapService(AdminUserRepository adminUserRepository,
                                 PasswordEncoder passwordEncoder,
                                 @Value("${admin.bootstrap.username}") String bootstrapUsername,
                                 @Value("${admin.bootstrap.password:}") String bootstrapPassword) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapUsername = bootstrapUsername;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        if (!StringUtils.hasText(bootstrapPassword)) {
            log.warn("No admin user exists. Set ADMIN_BOOTSTRAP_PASSWORD to create the initial administrator.");
            return;
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(bootstrapUsername);
        adminUser.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
        adminUserRepository.save(adminUser);

        log.info("Bootstrapped admin user '{}'. Rotate this password after first login.", bootstrapUsername);
    }
}
