export const GET_SITE_CONFIG = `
  query GetSiteConfig($key: String!) {
    siteConfig(key: $key) {
      key
      value
      updatedAt
    }
  }
`;

export const GET_ALL_SITE_CONFIG = `
  query GetAllSiteConfig {
    allSiteConfig {
      key
      value
      updatedAt
    }
  }
`;

export const GET_POSTS = `
  query GetPosts($status: PostStatus, $tag: String, $page: Int, $pageSize: Int) {
    posts(status: $status, tag: $tag, page: $page, pageSize: $pageSize) {
      nodes {
        id
        slug
        title
        excerpt
        authorType
        authorName
        authorMeta
        status
        tags
        readingTimeMinutes
        publishedAt
        createdAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const GET_POST = `
  query GetPost($slug: String!) {
    post(slug: $slug) {
      id
      slug
      title
      content
      excerpt
      authorType
      authorName
      authorMeta
      status
      tags
      readingTimeMinutes
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_SWITCHES = `
  query GetSwitches($type: SwitchType, $manufacturer: String, $page: Int, $pageSize: Int) {
    switches(type: $type, manufacturer: $manufacturer, page: $page, pageSize: $pageSize) {
      nodes {
        id
        name
        manufacturer
        type
        actuationForceGf
        bottomOutForceGf
        preTravelMm
        totalTravelMm
        forceCurve
        soundProfile
        springType
        stemMaterial
        housingMaterial
        priceUsd
        imageUrl
        tags
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

export const GET_SWITCH = `
  query GetSwitch($id: ID!) {
    switch(id: $id) {
      id
      name
      manufacturer
      type
      actuationForceGf
      bottomOutForceGf
      preTravelMm
      totalTravelMm
      forceCurve
      soundProfile
      soundSampleUrl
      springType
      stemMaterial
      housingMaterial
      priceUsd
      imageUrl
      sourceUrl
      tags
      createdAt
      updatedAt
    }
  }
`;

export const COMPARE_SWITCHES = `
  query CompareSwitches($ids: [ID!]!) {
    compareSwitches(ids: $ids) {
      id
      name
      manufacturer
      type
      actuationForceGf
      bottomOutForceGf
      preTravelMm
      totalTravelMm
      forceCurve
      soundProfile
      springType
      stemMaterial
      housingMaterial
      priceUsd
      tags
    }
  }
`;

export const GET_SYSTEM_METRICS = `
  query GetSystemMetrics {
    systemMetrics {
      cpuUsagePercent
      memoryUsedBytes
      memoryTotalBytes
      diskUsedBytes
      diskTotalBytes
      uptimeSeconds
      loadAverage1m
      loadAverage5m
      loadAverage15m
      networkRxBytesPerSec
      networkTxBytesPerSec
      containerMetrics {
        name
        cpuPercent
        memoryUsedBytes
        memoryLimitBytes
        status
      }
      timestamp
    }
  }
`;
