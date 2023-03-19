import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './orders'

interface TicketAttr {
  id: string
  title: string
  price: number
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  version: number
  orderId: string
  isReserved: () => Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttr): TicketDoc
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    orderId: { type: String }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)
ticketSchema.set('versionKey', 'version')
// con el plugin,, sin pasar el dato de la version actualiza a la nueva version
ticketSchema.plugin(updateIfCurrentPlugin)

// ticketSchema.pre('save', function (next) {
// console.log('pre save order:ticket this value', this.get('version'))
// this.$where = {
//   version: this.get('version')
// }
// this.increment()
/**
    el plugin instala el pre:save $where  `version: this.get('version')` (sin el -1)
   */

/*
   sin plugin, sin where, sin manual increment, sin mandar version en save
  crea v0
  update v1. pre:0, post: 0 (no incremento version)
  -- segundo update falla, xq no encuentra el v1
   */
/*
  sin plugin, con where SIN -1, sin manual increment, sin mandar version en save
  crea v0
  update v1, pre:0, post:0 (no actualizo version)
  -- segundo update falla
  */
/*
  sin plugin, con where -1, sin manual increment, sin mandar version en save
  crea v0
  falla. no encuentra doc con version -1
  */

/*
  sin plugin, con where SIN -1, sin manual increment, mandar version actualizada
  crea v0
  falla: no encuentra v1, hay que usar $where con -1
  */

/*
  sin plugin, sin where, sin manual increment, mandar version en save actualizada
  crea v0
  update v1, pre:1 post:1
  -- segundo update OK
  */

/*
  sin plugin, sin where, manual increment version, sin mandar version en save
  crea v0
  update v1, pre:0 post:1
  -- segundo update OK
  */
/*
  sin plugin, con where SIN -1, sin manual increment, SIN mandar version actualizada
  crea v0
   guarda sin actualizar v0
   segundo update falla, no encuentra v2
  */
/*
  sin plugin, con where SIN -1, con manual increment, SIN mandar version actualizada
  igual q lo que hace el plugin
  crea v0
  update v1, pre:0 post:1
  -- segundo update OK
  */

/**
   si mando la version actualizada incluir where -1 para q el presave/update encuentre el registro a actualizar
   con la nueva version, SIN manualmente incrementar la version
   --
   si NO mando la version actualizada, no es necesario incluir where, o si se incluye.. usar sin -1
   y manualmente incrementar la version
   */

//   next()
// })
// ticketSchema.post('save', function (doc /*, next*/) {
//   console.log('post save order:ticket this value', this.get('version'))
//   // next()
// })
ticketSchema.statics.build = (attr: TicketAttr) => {
  return new Ticket({
    _id: attr.id,
    title: attr.title,
    price: attr.price
  })
}

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: { $ne: OrderStatus.Cancelled }
  })
  return !!existingOrder
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
