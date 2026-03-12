export const LOGIN = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      expiresAt
    }
  }
`;

export const CREATE_POST = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      slug
      title
      status
    }
  }
`;

export const UPDATE_POST = `
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      slug
      title
      status
    }
  }
`;

export const DELETE_POST = `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const CREATE_SWITCH = `
  mutation CreateSwitch($input: CreateSwitchInput!) {
    createSwitch(input: $input) {
      id
      name
      manufacturer
      type
    }
  }
`;

export const UPDATE_SWITCH = `
  mutation UpdateSwitch($id: ID!, $input: UpdateSwitchInput!) {
    updateSwitch(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_SWITCH = `
  mutation DeleteSwitch($id: ID!) {
    deleteSwitch(id: $id)
  }
`;

export const UPDATE_SITE_CONFIG = `
  mutation UpdateSiteConfig($key: String!, $value: JSON!) {
    updateSiteConfig(key: $key, value: $value) {
      key
      value
      updatedAt
    }
  }
`;
