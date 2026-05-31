import { NextResponse } from 'next/server'
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo } from '@/lib/dynamo'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = 'Tasks'

export async function GET() {
  try {
    const result = await dynamo.send(
      new ScanCommand({ TableName: TABLE_NAME })
    )
    return NextResponse.json({ tasks: result.Items ?? [] }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener las tareas:', error)
    return NextResponse.json(
      { error: 'Error interno al obtener las tareas.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, description } = body

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'El campo "título" es obligatorio.' },
        { status: 400 }
      )
    }

    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false,
      createdAt: new Date().toISOString(),
    }

    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newTask,
      })
    )

    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    console.error('Error al crear la tarea:', error)
    return NextResponse.json(
      { error: 'Error interno al crear la tarea.' },
      { status: 500 }
    )
  }
}
