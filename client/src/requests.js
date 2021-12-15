const enpointURL = 'http://localhost:9000/graphql'

export async function graphQLQuery(query, variables) {
    const response = await fetch(enpointURL, {
        method: "POST",
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({query,variables
        })
    });
    const responseBody = await response.json();
    if (responseBody.errors){
        const errorMessage = responseBody.errors.map((error) => error.message).join('\n');
        throw new Error(errorMessage)
    }
    return responseBody.data
}


export async function loadJob(id) {
    const query = `query JobQuery($id: ID!){
                job(id: $id) {
                  id
                  title
                  description
                  company {
                    id
                    name
                  }
                }
            }
            `
    const variables = {id};
    const {job} = await graphQLQuery(query, variables);
    return job;
}

export async function loadJobs() {
    const query = `query JobsQuery{
                jobs {
                  id
                  title
                  company {
                    id
                    name
                  }
                }
            }
            `     
    const {jobs} = await graphQLQuery(query);
    return jobs;
}

export async function loadCompany(id) {
    const query = `query CompanyQuery($id: ID!){
        company(id: $id){
          id
          name
          description
          jobs {
            id
            title
          }
    
        }
    }
            `     
    const variables = {id}
    const {company} = await graphQLQuery(query, variables);
    return company;
}