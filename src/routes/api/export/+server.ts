import { exportReferenceSchems } from "$lib/config/zod-schemas";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import prisma from '$lib/config/prisma.js';
import fs from 'fs'
import path from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, Media, ImageRun } from 'docx';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    const session = await event.locals.auth.validate();
    const form = await superValidate(event.request, zod(exportReferenceSchems));
    const references = await prisma.reference.findMany({
      where: {
        id: {
          in: form.data.ids
        }
      },
      include: {
				// Include all relation fields you want to return
				country: true,
				businessLine: true,
				projectType: true,
				clients: true,
				people: true,
				projectManagers: true
			}
    });

    const columns = {
      country: {
        accessor: (entity) => entity.country.map((item) => item.name_fi).join(', ')
      },
      businessLine: {
        accessor: (entity) => entity.businessLine.map((item) => item.name_fi).join(', ')
      },
      projectType: {
        accessor: (entity) => entity.projectType.map((item) => item.name_fi).join(', ')
      },
      projectManagers: {
        accessor: (entity) => entity.projectManagers.map((item) => `${item.firstName} ${item.lastName}`).join(', ')
      },
      people: {
        accessor: (entity) => entity.people.map((item) => `${item.firstName} ${item.lastName}`).join(', ')
      },
      clients: {
        accessor: (entity) => entity.clients.map((item) => item.name_fi).join(', ')
      }
    }

    async function generateDOCX() {
      // Create a new Document
      const imgFilePath = path.resolve('data', 'logo.png');
      const imageBuffer = fs.readFileSync(imgFilePath); // Replace with your image path
      const tableRows = references.map(item => {
        return new TableRow({
          children: form.data.columns.map((column) => {
            console.log({column}, columns[column] ? columns[column].accessor(item) : item[column])
            return new TableCell({ children: [new Paragraph(columns[column] ? columns[column].accessor(item) : (item[column] || 'None'))] })
          })
        });
      });
    
      // Create the table
      const doc = new Document({
        sections: [
          {
          children: [
              new Paragraph({
                  children: [
                      new ImageRun({
                          data: imageBuffer,
                          transformation: {
                              width: 400,
                              height: 114,
                          },
                      }),
                  ],
              }),
              new Paragraph({
                text: 'References',
                heading: 'Heading1',
                alignment: 'center',
              }),
              new Table({
                width: {
                  size: 100,
                  type: 'pct',
                },
                rows: [
                  new TableRow({
                    children: form.data.columns.map((column) => {
                      return new TableCell({ children: [new Paragraph(column)] })
                    })
                  }),
                  ...tableRows,
                ],
              })
          ],
      }
      ]});
    
      const buffer = await Packer.toBuffer(doc);
      return buffer
    }
    const fileBuffer = await generateDOCX()
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="exported-file.docx"',
      }
    });
}