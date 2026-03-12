package com.thekeyswitch.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class InternalNetworkAuthorizationManagerTest {

    private final InternalNetworkAuthorizationManager authorizationManager =
            new InternalNetworkAuthorizationManager("127.0.0.1/32,10.0.0.0/8,172.16.0.0/12");

    @Test
    void check_withLoopbackAddress_grantsAccess() {
        AuthorizationDecision decision = authorizationManager.check(
                () -> null,
                new RequestAuthorizationContext(requestFrom("127.0.0.1"))
        );

        assertThat(decision).isNotNull();
        assertThat(decision.isGranted()).isTrue();
    }

    @Test
    void check_withInternalDockerAddress_grantsAccess() {
        AuthorizationDecision decision = authorizationManager.check(
                () -> null,
                new RequestAuthorizationContext(requestFrom("172.18.0.10"))
        );

        assertThat(decision).isNotNull();
        assertThat(decision.isGranted()).isTrue();
    }

    @Test
    void check_withExternalAddress_deniesAccess() {
        AuthorizationDecision decision = authorizationManager.check(
                () -> null,
                new RequestAuthorizationContext(requestFrom("8.8.8.8"))
        );

        assertThat(decision).isNotNull();
        assertThat(decision.isGranted()).isFalse();
    }

    private MockHttpServletRequest requestFrom(String remoteAddr) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/actuator/health");
        request.setRemoteAddr(remoteAddr);
        return request;
    }
}
