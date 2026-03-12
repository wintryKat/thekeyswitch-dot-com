-- Profile and site configuration seed data
INSERT INTO site_config (key, value) VALUES
('profile.hero', '{
  "name": "Kat",
  "tagline": "Senior Web Engineer",
  "subtitle": "Building polished, production-grade web applications with modern tooling and a love for mechanical keyboards.",
  "location": "United States",
  "availableForHire": true
}'::jsonb),

('profile.skills', '{
  "languages": ["Java", "TypeScript", "JavaScript", "SQL", "HTML/CSS", "Python"],
  "frontend": ["React", "Next.js", "Tailwind CSS", "D3.js", "Three.js", "WebXR"],
  "backend": ["Spring Boot", "Spring Security", "GraphQL", "REST APIs", "JPA/Hibernate"],
  "databases": ["PostgreSQL", "Redis", "MongoDB"],
  "infrastructure": ["Docker", "Docker Compose", "Caddy", "Prometheus", "GitHub Actions", "Linux"],
  "tools": ["Git", "Gradle", "npm", "Flyway", "CrowdSec"]
}'::jsonb),

('profile.experience', '[
  {
    "title": "Senior Web Engineer",
    "company": "thekeyswitch.com",
    "period": "2026 - Present",
    "description": "Designed and built a full-stack portfolio platform demonstrating enterprise-grade architecture: Spring Boot GraphQL API, Next.js frontend, PostgreSQL, Docker Compose deployment with Caddy reverse proxy, CrowdSec WAF, and Prometheus observability.",
    "highlights": ["Full-stack architecture", "Self-hosted infrastructure", "CI/CD pipeline", "Real-time metrics dashboard"]
  }
]'::jsonb),

('profile.education', '[
  {
    "degree": "Computer Science",
    "institution": "Self-directed + Professional Experience",
    "period": "Ongoing",
    "description": "Continuous learning through production systems, open-source contributions, and hands-on engineering."
  }
]'::jsonb),

('profile.projects', '[
  {
    "name": "Keyboard Switch Comparison Tool",
    "description": "Interactive D3.js force-curve visualizations for comparing mechanical keyboard switches.",
    "tech": ["D3.js", "React", "GraphQL", "PostgreSQL"],
    "url": "/switches"
  },
  {
    "name": "Live Weather Dashboard",
    "description": "Real-time weather data with geolocation, trend charts, and responsive design.",
    "tech": ["Open-Meteo API", "Recharts", "Geolocation API"],
    "url": "/weather"
  },
  {
    "name": "System Metrics Dashboard",
    "description": "Real-time VPS health monitoring with Prometheus integration and WebSocket updates.",
    "tech": ["Prometheus", "WebSocket", "Recharts", "Spring Boot"],
    "url": "/metrics"
  },
  {
    "name": "WebXR Mechanical Workshop",
    "description": "Interactive 3D scene themed around mechanical keyboards, built with React Three Fiber.",
    "tech": ["Three.js", "React Three Fiber", "WebXR", "GLTF"],
    "url": "/xr"
  }
]'::jsonb);
