/**
 * @copyright Copyright 2014 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @fileoverview Tests for the dataViewService service.
 * @author joemu@google.com (Joe Allan Muharsky)
 */

goog.require('p3rf.perfkit.explorer.application.module');
goog.require('p3rf.perfkit.explorer.components.widget.data_viz.gviz.getGvizDataTable');
goog.require('p3rf.perfkit.explorer.components.widget.query.DataViewService');
goog.require('p3rf.perfkit.explorer.models.SortOrder');
goog.require('p3rf.perfkit.explorer.models.DataViewModel');

describe('dataViewService', function() {
  var DataViewModel = p3rf.perfkit.explorer.models.DataViewModel;
  var SortOrder = p3rf.perfkit.explorer.models.SortOrder;
  var svc, gvizDataViewMock, gvizDataTable;

  beforeEach(module('explorer'));

  beforeEach(inject(function(dataViewService, GvizDataTable) {
    svc = dataViewService;
    gvizDataTable = GvizDataTable;
  }));

  describe('create', function() {
    var dataTable;

    beforeEach(function() {
      var data = {
        cols: [
          {id: 'date', label: 'Date', type: 'date'},
          {id: 'value', label: 'Fake values 1', type: 'number'},
          {id: 'value', label: 'Fake values 2', type: 'number'}
        ],
        rows: [
          {c: [
            {v: '2013/03/03 00:48:04'},
            {v: 0.5},
            {v: 3}
          ]},
          {c: [
            {v: '2013/03/04 00:50:04'},
            {v: 0.1},
            {v: 5}
          ]},
          {c: [
            {v: '2013/03/05 00:59:04'},
            {v: 0.3},
            {v: 1}
          ]},
          {c: [
            {v: '2013/03/06 00:50:04'},
            {v: 0.7},
            {v: 2}
          ]},
          {c: [
            {v: '2013/03/07 00:59:04'},
            {v: 0.2},
            {v: 6}
          ]}
        ]
      };

      dataTable = new gvizDataTable(data);
    });

    it('should return the correct dataViewJson.', function() {
      var model = new DataViewModel();
      model.columns = [0, 2];
      model.filter = [
        {
          column: 1,
          minValue: 0,
          maxValue: 0.2
        }
      ];
      model.sort = [
        {
          column: 2,
          desc: true
        }
      ];

      var dataViewJson = svc.create(dataTable, model);

      var expectedDataViewJson = [
        {
          columns: [0, 2],
          rows: [1, 4]
        },
        {
          rows: [1, 0]
        }
      ];
      expect(dataViewJson).toEqual(expectedDataViewJson);
    });

    it('should return an error when an error occurred on columns property.',
        function() {
          var model = new DataViewModel();
          model.columns = [-1];

          var dataViewJson = svc.create(dataTable, model);
          expect(dataViewJson.error).toBeDefined();
          expect(dataViewJson.error.property).toEqual('columns');
        }
    );

    it('should return an error when an error occurred on filter property.',
        function() {
          var model = new DataViewModel();
          model.filter = [-1];

          var dataViewJson = svc.create(dataTable, model);
          expect(dataViewJson.error).toBeDefined();
          expect(dataViewJson.error.property).toEqual('filter');
        }
    );

    it('should return an error when an error occurred on sort property.',
        function() {
          var model = new DataViewModel();
          model.sort = [-1];

          var dataViewJson = svc.create(dataTable, model);
          expect(dataViewJson.error).toBeDefined();
          expect(dataViewJson.error.property).toEqual('sort');
        }
    );
  });

  describe('getSortedColumns', function() {
    var dataTable;

    beforeEach(function() {
      var data = {
        cols: [
          {id: 'colskip', label: 'ColSkip', type: 'number'},
          {id: 'col3', label: 'Col3', type: 'number'},
          {id: 'col1', label: 'Col1', type: 'number'},
          {id: 'col2', label: 'Col2', type: 'number'}
        ],
        rows: []
      };

      dataTable = new gvizDataTable(data);
    });

    it('should return the column indexes in ascending order when no ' +
       'order is passed.', function() {
      var cols = svc.getSortedColumns(dataTable, 0);

      expect(cols).toEqual([2,3,1,0]);
    });

    it('should return the column indexes in ascending order when ' +
       'SortOrder.ASCENDING is provided.', function() {
      var cols = svc.getSortedColumns(dataTable, 0, SortOrder.ASCENDING);

      expect(cols).toEqual([2,3,1,0]);
    });

    it('should return the column indexes in descending order when ' +
       'SortOrder.DESCENDING is provided.', function() {
      var cols = svc.getSortedColumns(dataTable, 0, SortOrder.DESCENDING);

      expect(cols).toEqual([0,1,3,2]);
    });

    it('should ignore the first n columns specified by sort_column_offset',
        function() {
      var cols = svc.getSortedColumns(dataTable, 1);

      expect(cols).toEqual([0,2,3,1]);
    });
  });
});
