package com.insureflow.health;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class HealthControllerTest {
    @Test void healthPayloadHasExpectedStatus() {
        var payload = new HealthController().health();
        assertThat(payload.get("status")).isEqualTo("UP");
        assertThat(payload.get("service")).isEqualTo("insureflow-api");
    }
}
