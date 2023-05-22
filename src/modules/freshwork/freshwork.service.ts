import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FreshworkService {
  constructor(private readonly httpService: HttpService) {}

  async getAllFilters() {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}contacts/filters`;
    const resp: any = await firstValueFrom(this.httpService.get(url, config));

    if (resp.status == 200) {
      return resp.data.filters;
    }
    return [];
  }

  async getContactsFromFilter(filterId: string, page = 1) {
    const allContacts = [];
    let total_pages = 1;

    let resp = await this.getContacts(filterId, page);
    if (resp.status == 200) {
      if (resp?.data?.meta && resp?.data?.meta?.total_pages > page) {
        total_pages = resp?.data?.meta?.total_pages;
        for (let index = page + 1; index < total_pages; index++) {
          resp = await this.getContacts(filterId, index);
          allContacts.push(...resp.data.contacts);
        }
      }
      return allContacts;
    }
    return [];
  }

  async getContactDetails(id: string) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}contacts/${id}?include=sales_accounts`;
    const resp: any = await firstValueFrom(this.httpService.get(url, config));

    if (resp.status == 200) {
      return resp.data.contact;
    }
    return [];
  }

  async getAccountDetails(id: string) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}sales_accounts/${id}`;
    const resp: any = await firstValueFrom(this.httpService.get(url, config));

    if (resp.status == 200) {
      return resp.data.sales_account;
    }
    return [];
  }

  async getContacts(filterId: string, page = 1) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}contacts/view/${filterId}?page=${page}`;
    const resp: any = await firstValueFrom(this.httpService.get(url, config));
    return resp;
  }

  async getFilteredContacts(filters: any, page = 1) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}filtered_search/contact?page=${page}`;
    const resp: any = await firstValueFrom(
      this.httpService.post(url, { filter_rule: filters }, config),
    );
    return resp;
  }

  async getFilteredContactsList(filters: any, page = 1) {
    const allContacts = [];
    let total_pages = 1;

    let resp = await this.getFilteredContacts(filters, page);
    if (resp.status == 200) {
      if (resp?.data?.meta && resp?.data?.meta?.total > 10) {
        total_pages = Math.ceil(resp?.data?.meta?.total / 10);
        for (let index = page; index <= total_pages; index++) {
          resp = await this.getFilteredContacts(filters, index);
          allContacts.push(...resp.data.contacts);
        }
      } else {
        allContacts.push(...resp.data.contacts);
      }
      return allContacts;
    }
    return [];
  }

  async getFilteredContactsCount(filters: any, page = 1) {
    const resp = await this.getFilteredContacts(filters, page);
    if (resp.status == 200) {
      return resp.data.meta.total;
    }
    return [];
  }

  async getFilteredAccounts(filters: any, page = 1) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}filtered_search/sales_account?page=${page}`;
    const resp: any = await firstValueFrom(
      this.httpService.post(url, { filter_rule: filters }, config),
    );
    return resp;
  }

  async getFilteredAccountList(filters: any, page = 1) {
    const allAccounts = [];
    let total_pages = 1;

    let resp = await this.getFilteredAccounts(filters, page);
    if (resp.status == 200) {
      if (resp?.data?.meta && resp?.data?.meta?.total > 10) {
        total_pages = Math.ceil(resp?.data?.meta?.total / 10);
        for (let index = page; index <= total_pages; index++) {
          resp = await this.getFilteredAccounts(filters, index);
          allAccounts.push(...resp.data.sales_accounts);
        }
      } else {
        allAccounts.push(...resp.data.sales_accounts);
      }
      return allAccounts;
    }
    return [];
  }

  async addMessageLog(
    messageText: string,
    contactId: string,
    call_direction = false,
  ) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const url = `${process.env.FRESHWORK_URL}phone_calls`;
    const resp: any = await firstValueFrom(
      this.httpService.post(
        url,
        {
          phone_call: {
            call_direction: call_direction,
            targetable_type: 'contact',
            outcome_id: contactId,
            targetable: {
              id: '17036923722',
            },
            note: {
              description: messageText,
            },
          },
        },
        config,
      ),
    );
    return resp;
  }

  async updateContact(campaignName: string, contactId: string) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const url = `${process.env.FRESHWORK_URL}contacts/${contactId}`;

    const resp: any = await firstValueFrom(
      this.httpService.put(
        url,
        {
          contact: {
            custom_field: {
              cf_campaign_name: campaignName,
            },
          },
        },
        config,
      ),
    );
    return resp;
  }

  async updateAccount(campaignName: string, salesAccountID: string) {
    const config = {
      headers: {
        Authorization: `Token token=${process.env.FRESHWORK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const url = `${process.env.FRESHWORK_URL}sales_accounts/${salesAccountID}`;

    const resp: any = await firstValueFrom(
      this.httpService.put(
        url,
        {
          sales_account: {
            custom_field: {
              cf_campaign: campaignName,
            },
          },
        },
        config,
      ),
    );
    return resp;
  }
}
