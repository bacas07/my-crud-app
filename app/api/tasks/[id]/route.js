import { NextResponse } from 'next/server'
import { GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo } from '@/lib/dynamo'

const TABLE_NAME = 'Tasks'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, description, completed } = body

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'El campo "título" es obligatorio.' },
        { status: 400 }
      )
    }

    const updatedTask = await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression:
          'SET #title = :title, #description = :description, #completed = :completed',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#description': 'description',
          '#completed': 'completed',
        },
        ExpressionAttributeValues: {
          ':title': title.trim(),
          ':description': description ? description.trim() : '',
          ':completed': typeof completed === 'boolean' ? completed : false,
        },
        ReturnValues: 'ALL_NEW',
      })
    )

    return NextResponse.json(
      { task: updatedTask.Attributes },
      { status: 200 }
    )
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return NextResponse.json(
        { error: 'Tarea no encontrada. No se pudo actualizar.' },
        { status: 404 }
      )
    }
    console.error('Error al actualizar la tarea:', error)
    return NextResponse.json(
      { error: 'Error interno al actualizar la tarea.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const existing = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    )

    if (!existing.Item) {
      return NextResponse.json(
        { error: 'Tarea no encontrada. No se pudo eliminar.' },
        { status: 404 }
      )
    }

    await dynamo.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    )

    return NextResponse.json(
      { message: 'Tarea eliminada correctamente.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
    return NextResponse.json(
      { error: 'Error interno al eliminar la tarea.' },
      { status: 500 }
    )
  }
}
