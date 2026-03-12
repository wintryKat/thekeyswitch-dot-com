package com.thekeyswitch.api.config;

import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.function.Supplier;

public class InternalNetworkAuthorizationManager
        implements AuthorizationManager<RequestAuthorizationContext> {

    private final List<IpAddressMatcher> allowedNetworks;

    public InternalNetworkAuthorizationManager(String configuredNetworks) {
        this.allowedNetworks = StringUtils.commaDelimitedListToSet(configuredNetworks).stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(IpAddressMatcher::new)
                .toList();
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication,
                                       RequestAuthorizationContext context) {
        boolean allowed = allowedNetworks.stream()
                .anyMatch(matcher -> matcher.matches(context.getRequest()));
        return new AuthorizationDecision(allowed);
    }
}
