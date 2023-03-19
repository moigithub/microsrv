import nats, { Stan } from 'node-nats-streaming'

// const stan = nats.connect('ticketing', '123', {
//   url: 'http://localhost:4222'
// })

// stan.on('connect', () => {
//   console.log('connected to nats')

//   stan.on('close', () => {
//     console.log('disconnected from nats')
//     process.exit(0)
//   })
// })

// process.on('SIGINT', () => stan.close())
// process.on('SIGTERM', () => stan.close())

// export { stan as client }

class NatsWrapper {
  private _client?: Stan

  get client(): Stan {
    if (!this._client) {
      throw new Error('connect first')
    }
    return this._client
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url })

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('NATS connected', clusterId, clientId)

        resolve(this.client)
      })

      this.client.on('error', err => {
        reject(err)
      })
    })
  }
}

export const natsWrapper = new NatsWrapper()
