import {isLoggedIn, getAccessToken} from "./auth"
import gql from "graphql-tag"
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from 'apollo-boost'

const enpointURL = 'http://localhost:9000/graphql'

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()){
    operation.setContext({
      headers:{
        'authorization': 'Bearer ' + getAccessToken()
      }
    })
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({uri: enpointURL})
  ]),
  cache: new InMemoryCache()
});

export async function graphQLQuery(query, variables) {
  const request = {
    method: "POST",
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({query,variables})
    };
  if (isLoggedIn()){
    request.headers['authorization'] = 'Bearer ' + getAccessToken()
  }
  const response = await fetch(enpointURL, request);
    const responseBody = await response.json();
    if (responseBody.errors){
        const errorMessage = responseBody.errors.map((error) => error.message).join('\n');
        throw new Error(errorMessage);
    }
    return responseBody.data
}


export async function loadJob(id) {
    const query = gql`
              query JobQuery($id: ID!){
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
    const {data: {job}} = await client.query({query, variables});
    return job;
}
export async function createJob(input) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input){
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
  const {data: {job}} = await client.mutate({mutation, variables: {input}});
  return job;
}

export async function loadJobs() {
    const query = gql`query JobsQuery{
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
   
    const {data: {jobs}} = await client.query({query});
    return jobs;
}

export async function loadCompany(id) {
    const query = gql`query CompanyQuery($id: ID!){
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
    const {data: {company}} = await client.query({query, variables});
    return company;
}