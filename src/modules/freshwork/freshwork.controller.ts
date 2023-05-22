import { Response } from 'express';
import {
  Controller,
  Get,
  Param,
  HttpStatus,
  Res,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { FreshworkService } from './freshwork.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@Controller('freshwork')
export class FreshworkController {
  constructor(private readonly freshworkService: FreshworkService) {}

  @UseGuards(AuthGuard)
  @Get('filter')
  async getAllFilter(@Res() response: Response) {
    try {
      const filters = await this.freshworkService.getAllFilters();
      return response
        .status(HttpStatus.OK)
        .send({ message: ['Freshwork Filters'], data: filters });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('filter/:id')
  async getFilteredContacts(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const contacts = await this.freshworkService.getContactsFromFilter(id);
      return response.status(HttpStatus.OK).send({
        message: ['Filtered Contact'],
        data: { contacts },
      });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('contact/:id')
  async getContactDetails(@Param('id') id: string, @Res() response: Response) {
    try {
      const contact = await this.freshworkService.getContactDetails(id);
      return response.status(HttpStatus.OK).send({
        message: ['Contact Details'],
        data: { contact },
      });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('account/:id')
  async getAccountDetails(@Param('id') id: string, @Res() response: Response) {
    try {
      const account = await this.freshworkService.getAccountDetails(id);
      return response.status(HttpStatus.OK).send({
        message: ['Account Details'],
        data: { account },
      });
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Get('filter/count/:id')
  async getFilteredContactCount(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const resp = await this.freshworkService.getContacts(id);
      if (resp.status == HttpStatus.OK) {
        return response.status(HttpStatus.OK).send({
          message: ['Filtered Count'],
          data: {
            total_pages: resp?.data?.meta?.total_pages,
            total: resp?.data?.meta?.total,
          },
        });
      } else {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: ['Something went wrong'] });
      }
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: ['Something went wrong'], error: error });
    }
  }

  @UseGuards(AuthGuard)
  @Post('filter')
  async getFilteredContactsList(
    @Body() filterData: [any],
    @Res() response: Response,
  ) {
    try {
      const accFilterData = [];
      const contFilterData = [];
      if (filterData['filter_rule'].length > 0) {
        filterData['filter_rule'].forEach((element) => {
          if (element.tableName == 'sales_account') {
            accFilterData.push({
              attribute: element.attribute,
              operator: element.operator,
              value: element.value,
            });
          } else {
            contFilterData.push({
              attribute: element.attribute,
              operator: element.operator,
              value: element.value,
            });
          }
        });
      }

      if (accFilterData.length == 0) {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: ['Please add account filter'] });
      }

      const accounts = await this.freshworkService.getFilteredAccountList(
        accFilterData,
      );

      const accountName = [];
      accounts.forEach((acc) => {
        accountName.push(acc.name);
      });

      contFilterData.push({
        attribute: 'sales_account.name',
        operator: 'contains_any',
        value: accountName,
      });

      const contactsCount =
        await this.freshworkService.getFilteredContactsCount(contFilterData);

      return response.status(HttpStatus.OK).send({
        message: ['Filtered Contact'],
        data: { contactsCount },
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: ['Something went wrong'],
        error: error,
      });
    }
  }
}
