import { exportReferenceSchems, searchReferenceSchema, exportSearcResultsReferenceSchema } from "$lib/config/zod-schemas";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import prisma from '$lib/config/prisma.js';
import fs from 'fs'
import path from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, Media, ImageRun } from 'docx';
import { isValidDate } from "$lib/utils";

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  exportSearcResultsReferenceSchema
    const session = await event.locals.auth.validate();
    const form = await superValidate(event.request, zod(exportSearcResultsReferenceSchema));
    console.log(form.data)
    const {
      minStartDate,
      maxEndDate,
      minProjectValue,
      maxProjectValue,
      projectTypes,
      businessLines,
      clients,
      persons,
      projectManagers,
        language,
      countries,
      search
    } = form.data;


    const query = {
      where: {
        AND: [
          ...(search
            ? [
                {
                  OR: [
                    {
                      people: {
                        some: {
                          OR: [
                            {
                              firstName: {
                                contains: search,
                                mode: 'insensitive', // Case-insensitive search
                              },
                            },
                            {
                              lastName: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      projectManagers: {
                        some: {
                          OR: [
                            {
                              firstName: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                            {
                              lastName: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      description_en: {
                        contains: search,
                        mode: 'insensitive' // Optional: makes the search case-insensitive
                      }
                    },
                    {
                      description_fi: {
                        contains: search,
                        mode: 'insensitive'
                      }
                    },
                    {
                      clientContact: {
                        contains: search,
                        mode: 'insensitive'
                      }
                    },
                    {
                      country: {
                        some: {
                          OR: [
                            {
                              name_fi: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                            {
                              name_en: {
                                contains: search,
                                mode: 'insensitive',
                              },
                            },
                          ],
                        }
                      }
                    }
                  ]
                }
              ]
            : []),
            ...((language && language !== 'both')
              ? [
                  {
                    language
                  }
                ]
              : []),
          ...(minStartDate && isValidDate(minStartDate)
            ? [
                {
                  start_date: {
                    gte: new Date(minStartDate)
                  }
                }
              ]
            : []),
          ...(maxEndDate && isValidDate(minStartDate)
            ? [
                {
                  end_date: {
                    gte: new Date(maxEndDate)
                  }
                }
              ]
            : []),
  
          ...(minProjectValue
            ? [
                {
                  projectValue: {
                    gte: Number(minProjectValue)
                  }
                }
              ]
            : []),
          ...(maxProjectValue
            ? [
                {
                  projectValue: {
                    lte: Number(maxProjectValue)
                  }
                }
              ]
            : []),
          ...(projectTypes?.length
            ? [
                {
                  projectType: {
                    some: {
                      id: {
                        in: projectTypes
                      }
                    }
                  }
                }
              ]
            : []),
          ...(businessLines?.length
            ? [
                {
                  businessLine: {
                    some: {
                      id: {
                        in: businessLines
                      }
                    }
                  }
                }
              ]
            : []),
          ...(countries?.length
            ? [
                {
                  country: {
                    some: {
                      id: {
                        in: countries
                      }
                    }
                  }
                }
              ]
            : []),
          ...(clients?.length
            ? [
                {
                  clients: {
                    some: {
                      id: {
                        in: clients
                      }
                    }
                  }
                }
              ]
            : []),
          ...(persons?.length
            ? [
                {
                  people: {
                    some: {
                      id: {
                        in: persons
                      }
                    }
                  }
                }
              ]
            : []),
          ...(projectManagers?.length
            ? [
                {
                  projectManagers: {
                    some: {
                      id: {
                        in: projectManagers
                      }
                    }
                  }
                }
              ]
            : [])
        ]
      }
    };
    let references;
    try {
      references = await prisma.reference.findMany({
        ...query,
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
    } catch (error) {
      console.error(error);
    }
    console.log(references.length)
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