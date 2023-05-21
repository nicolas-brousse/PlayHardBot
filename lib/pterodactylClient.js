const axios = require('axios')

class Server {
  constructor(attributes) {
    this.identifier = attributes.identifier
    this.name = attributes.name
  }
}

class Stats {
  constructor(attributes) {
    this.currentState = attributes.current_state
  }
}

module.exports = class PterodactylClient {
  constructor(apiBaseUrl, apiToken) {
    this.apiBaseUrl = apiBaseUrl
    this.apiToken = apiToken

    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
        'Authorization': `Bearer ${apiToken}`,
      }
    })
  }

  async getServerList() {
    const response = await this.client.get('/api/client')

    return response.data.data.map(server => new Server(server.attributes))
  }

  async getServerResources(serverId) {
    const response = await this.client.get(`/api/client/servers/${serverId}/resources`)

    return new Stats(response.data.attributes)
  }

  async updateServerPower(serverId, signal) {
    const response = await this.client.post(`/api/client/servers/${serverId}/power`, {
      'signal': signal,
    })

    return response.status === 204
  }
}
