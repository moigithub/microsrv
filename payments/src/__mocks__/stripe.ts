export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({
      id: 'ch_3MmmrjDDAATQ2nEb1a9Aghit',
      object: 'charge'
    })
  }
}
