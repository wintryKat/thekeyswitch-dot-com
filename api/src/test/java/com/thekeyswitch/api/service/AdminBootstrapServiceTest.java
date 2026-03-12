package com.thekeyswitch.api.service;

import com.thekeyswitch.api.model.AdminUser;
import com.thekeyswitch.api.repository.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void run_withNoAdminsAndBootstrapPassword_createsAdminUser() throws Exception {
        AdminBootstrapService adminBootstrapService = new AdminBootstrapService(
                adminUserRepository,
                passwordEncoder,
                "admin",
                "super-secure-password"
        );

        when(adminUserRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("super-secure-password")).thenReturn("$2a$10$securehash");
        when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminBootstrapService.run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<AdminUser> userCaptor = ArgumentCaptor.forClass(AdminUser.class);
        verify(adminUserRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("admin");
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("$2a$10$securehash");
    }

    @Test
    void run_withExistingAdminUsers_doesNothing() throws Exception {
        AdminBootstrapService adminBootstrapService = new AdminBootstrapService(
                adminUserRepository,
                passwordEncoder,
                "admin",
                "super-secure-password"
        );

        when(adminUserRepository.count()).thenReturn(1L);

        adminBootstrapService.run(new DefaultApplicationArguments(new String[0]));

        verify(adminUserRepository, never()).save(any(AdminUser.class));
    }

    @Test
    void run_withoutBootstrapPassword_doesNothing() throws Exception {
        AdminBootstrapService adminBootstrapService = new AdminBootstrapService(
                adminUserRepository,
                passwordEncoder,
                "admin",
                ""
        );

        when(adminUserRepository.count()).thenReturn(0L);

        adminBootstrapService.run(new DefaultApplicationArguments(new String[0]));

        verify(adminUserRepository, never()).save(any(AdminUser.class));
    }
}
