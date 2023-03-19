import { OrderStatus } from '@moimio/common'
import mongoose from 'mongoose'

export { OrderStatus }
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttr {
  id: string
  version: number
  userId: string
  price: number
  status: OrderStatus
}

interface OrderDoc extends mongoose.Document {
  version: number
  price: number
  userId: string
  status: OrderStatus
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttr): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    }
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
  return new Order({
    _id: attr.id,
    version: attr.version,
    price: attr.price,
    userId: attr.userId,
    status: attr.status
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
