import { OrderStatus } from '@moimio/common'
import mongoose from 'mongoose'
import { TicketDoc } from './tickets'
export { OrderStatus }
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttr {
  userId: string
  status: OrderStatus
  expiredAt: Date
  ticket: TicketDoc
}

interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiredAt: Date
  ticket: TicketDoc
  version: number
  orderId?: string
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttr): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiredAt: {
      type: Date
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
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
orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attr: OrderAttr) => {
  return new Order(attr)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
