import axios, { AxiosError } from 'axios'
import { useState } from 'react'

interface ErrorMessage {
  message: string
  field?: string
}

interface BEError {
  errors: ErrorMessage[]
}
interface Props {
  url: string
  method: 'GET' | 'POST'
  body: { [key: string]: string }
  onSuccess: (data: any) => void
}

const useRequest = ({ url, method, body, onSuccess }: Props) => {
  const [errors, setErrors] = useState<ErrorMessage[] | []>([])

  const doRequest = async (values = {}) => {
    console.log({ body, values })
    try {
      const response = await axios({
        url,
        method,
        data: { ...body, ...values }
      })

      if (onSuccess) {
        onSuccess(response.data)
      }

      // return response.data
    } catch (error: unknown) {
      setErrors((error as AxiosError<BEError>).response?.data.errors || [])

      throw error
    }
  }

  return { doRequest, errors }
}

export default useRequest
