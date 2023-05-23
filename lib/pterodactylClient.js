import axios from 'axios'

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

export default class PterodactylClient {
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
    const { data: { data } } = await this.client.get('/api/client')

    return data.map(server => new Server(server.attributes))
  }

  async getServerResources(serverId) {
    const { data } = await this.client.get(`/api/client/servers/${serverId}/resources`)

    return new Stats(data.attributes)
  }

  async updateServerPower(serverId, signal) {
    const { status } = await this.client.post(`/api/client/servers/${serverId}/power`, { signal })

    return status === 204
  }
}
